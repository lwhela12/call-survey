import { randomUUID } from "node:crypto";
import {
  evaluateConditionalNext,
  evaluateCondition,
} from "@nesolagus/core";

export interface RuntimePersistence {
  createResponse(params: {
    sessionId: string;
    deploymentId?: string;
    draftId?: string;
    respondentName?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<{ id: string }>;
  saveAnswer(params: {
    responseId: string;
    questionId: string;
    answer: unknown;
  }): Promise<void>;
  completeResponse(responseId: string): Promise<void>;
}

export interface SurveyConfig {
  survey?: {
    id?: string;
    name?: string;
    [key: string]: unknown;
  };
  blocks: Record<string, any>;
}

interface SurveyState {
  surveyId: string;
  responseId: string;
  currentBlockId: string;
  variables: Record<string, any>;
  completedBlocks: string[];
  answers: Record<string, any>;
  metadata?: Record<string, any>;
}

interface RuntimeSession {
  sessionId: string;
  type: "preview" | "runtime";
  config: SurveyConfig;
  state: SurveyState;
  context?: {
    deploymentId?: string;
    draftId?: string;
  };
}

export interface StartPreviewParams {
  config: SurveyConfig;
  name?: string;
  tracking?: Record<string, unknown>;
}

export interface StartRuntimeParams extends StartPreviewParams {
  deploymentId?: string;
  draftId?: string;
  respondentName?: string | null;
}

export interface StartResponse {
  sessionId: string;
  responseId: string;
  firstQuestion: any;
}

export interface AnswerResponse {
  nextQuestion: any | null;
  progress: number;
}

export interface SessionStateResponse {
  currentQuestion: any | null;
  progress: number;
  isComplete: boolean;
  responseId: string;
}

export class RuntimeEngine {
  private sessions: Map<string, RuntimeSession> = new Map();

  constructor(private readonly persistence: RuntimePersistence) {}

  startPreview(params: StartPreviewParams): StartResponse {
    const { config, name } = params;
    this.ensureConfig(config);

    const sessionId = randomUUID();
    const responseId = randomUUID();

    const firstBlockId = this.getFirstBlockId(config);
    const firstBlock = config.blocks[firstBlockId];
    const state: SurveyState = {
      surveyId: (config.survey?.id as string) || "preview",
      responseId,
      currentBlockId: firstBlockId,
      variables: {
        user_name: name || "",
      },
      completedBlocks: [],
      answers: {},
      metadata: params.tracking ? { tracking: params.tracking } : undefined,
    };

    this.sessions.set(sessionId, {
      sessionId,
      type: "preview",
      config,
      state,
    });

    return {
      sessionId,
      responseId,
      firstQuestion: this.formatQuestionForClient(firstBlock, state.variables),
    };
  }

  async startRuntime(params: StartRuntimeParams): Promise<StartResponse> {
    const { config, name, deploymentId, draftId, tracking } = params;
    this.ensureConfig(config);

    const sessionId = randomUUID();
    const responseRecord = await this.persistence.createResponse({
      sessionId,
      deploymentId,
      draftId,
      respondentName: name || null,
      metadata: tracking ? { tracking } : undefined,
    });

    const firstBlockId = this.getFirstBlockId(config);
    const firstBlock = config.blocks[firstBlockId];

    const state: SurveyState = {
      surveyId: (config.survey?.id as string) || draftId || deploymentId || "runtime",
      responseId: responseRecord.id,
      currentBlockId: firstBlockId,
      variables: {
        user_name: name || "",
      },
      completedBlocks: [],
      answers: {},
      metadata: tracking ? { tracking } : undefined,
    };

    this.sessions.set(sessionId, {
      sessionId,
      type: "runtime",
      config,
      state,
      context: {
        deploymentId,
        draftId,
      },
    });

    return {
      sessionId,
      responseId: responseRecord.id,
      firstQuestion: this.formatQuestionForClient(firstBlock, state.variables),
    };
  }

  async submitAnswer(sessionId: string, questionId: string, answer: unknown): Promise<AnswerResponse> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error("Invalid session ID");
    }

    this.updateState(session, questionId, answer);

    const nextBlock = this.getNextQuestion(session, questionId, answer);
    const progress = this.calculateProgress(session);

    if (session.type === "runtime") {
      await this.persistence.saveAnswer({
        responseId: session.state.responseId,
        questionId,
        answer,
      });
    }

    return {
      nextQuestion: nextBlock
        ? this.formatQuestionForClient(nextBlock, session.state.variables)
        : null,
      progress,
    };
  }

  async completeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    if (session.type === "runtime") {
      await this.persistence.completeResponse(session.state.responseId);
    }

    this.sessions.delete(sessionId);
  }

  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  getSessionState(sessionId: string): SessionStateResponse {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const currentBlock = session.config.blocks[session.state.currentBlockId];
    const formatted = currentBlock
      ? this.formatQuestionForClient(currentBlock, session.state.variables)
      : null;

    const progress = this.calculateProgress(session);

    return {
      currentQuestion: formatted,
      progress,
      isComplete: !currentBlock,
      responseId: session.state.responseId,
    };
  }

  private ensureConfig(config: SurveyConfig) {
    if (!config || !config.blocks || typeof config.blocks !== "object") {
      throw new Error("Survey config with blocks is required");
    }
  }

  private getFirstBlockId(config: SurveyConfig): string {
    if (config.blocks.b0) {
      return "b0";
    }
    const firstKey = Object.keys(config.blocks)[0];
    if (!firstKey) {
      throw new Error("Survey config must have at least one block");
    }
    return firstKey;
  }

  private updateState(session: RuntimeSession, questionId: string, answer: any): void {
    const { state, config } = session;

    state.answers[questionId] = answer;
    if (!state.completedBlocks.includes(questionId)) {
      state.completedBlocks.push(questionId);
    }

    const block = config.blocks[questionId];

    if (block && block.variable) {
      state.variables[block.variable] = answer;
    }

    if (block && Array.isArray(block.options)) {
      const selectedOption = block.options.find((opt: any) => {
        if (opt.value === answer || opt.id === answer) {
          return true;
        }
        if (typeof opt.value === "boolean" && typeof answer === "string") {
          return opt.value === (answer === "true");
        }
        if (typeof opt.value === "string" && typeof answer === "boolean") {
          return (opt.value === "true") === answer;
        }
        return false;
      });

      if (selectedOption && selectedOption.setVariables) {
        Object.assign(state.variables, selectedOption.setVariables);
      }
    }

    this.updateSpecialVariables(state, questionId, answer);
  }

  private updateSpecialVariables(state: SurveyState, questionId: string, answer: any): void {
    switch (questionId) {
      case "b3":
        state.variables.user_name = answer || "";
        break;
      case "b4":
        state.variables.connection_type = answer;
        break;
      case "b5":
        state.variables.arts_connections = answer;
        state.variables.arts_connections_count = Array.isArray(answer) ? answer.length : 0;
        state.variables.arts_connections_contains_other = Array.isArray(answer)
          ? answer.includes("other")
          : false;
        break;
      case "b6":
        state.variables.arts_importance = answer;
        break;
      case "b7":
        if (typeof answer === "object" && answer !== null) {
          state.variables.videoask_share_response_id = (answer as any).responseId || null;
          state.variables.videoask_share_response_url = (answer as any).responseUrl || null;
        }
        break;
      case "b12":
        if (typeof answer === "object" && answer !== null) {
          state.variables.future_vision_type = (answer as any).type || "skipped";
          state.variables.future_vision_response_id = (answer as any).responseId || null;
          state.variables.future_vision_response_url = (answer as any).responseUrl || null;
        } else {
          state.variables.future_vision_type = "skipped";
        }
        break;
      case "b16":
        if (Array.isArray(answer)) {
          state.variables.contact_methods = answer;
          state.variables.wants_email = answer.includes("email");
          state.variables.wants_text = answer.includes("text");
          state.variables.wants_print = answer.includes("print") || answer.includes("newsletter");
          state.variables.wants_social = answer.includes("social");
          state.variables.wants_conversations = answer.includes("conversations");
          state.variables.wants_no_updates = answer.includes("no-updates");
        }
        break;
      case "b18":
        state.variables.demographics_consent = answer;
        break;
      case "b19":
        if (typeof answer === "object" && answer !== null) {
          Object.assign(state.variables, answer);
        }
        break;
      default:
        break;
    }
  }

  private getNextQuestion(session: RuntimeSession, currentQuestionId: string, answer: any): any | null {
    const { config, state } = session;
    const blocks = config.blocks;

    const currentBlock = blocks[currentQuestionId];
    if (!currentBlock) {
      return null;
    }

    let nextBlockId: string | null = null;

    if (answer === "" && currentBlock.onEmpty) {
      const onEmpty = currentBlock.onEmpty;
      if (onEmpty.message) {
        return {
          id: `${currentQuestionId}-empty-message`,
          type: "dynamic-message",
          content: onEmpty.message,
          next: onEmpty.next || currentBlock.next,
        };
      }
      nextBlockId = onEmpty.next || currentBlock.next || null;
    } else if (typeof currentBlock.next === "string") {
      nextBlockId = currentBlock.next;
    }

    if (!nextBlockId && Array.isArray(currentBlock.options)) {
      const selectedOption = currentBlock.options.find((opt: any) => {
        if (opt.value === answer || opt.id === answer) {
          return true;
        }
        if (typeof opt.value === "boolean" && typeof answer === "string") {
          return opt.value === (answer === "true");
        }
        if (typeof opt.value === "string" && typeof answer === "boolean") {
          return (opt.value === "true") === answer;
        }
        return false;
      });

      if (selectedOption && selectedOption.next) {
        nextBlockId = selectedOption.next;
      }
    }

    if (!nextBlockId) {
      const blockVariable = currentBlock.variable as string | undefined;
      if (currentBlock.next && typeof currentBlock.next === "object") {
        nextBlockId = evaluateConditionalNext(currentBlock.next, state.variables, blockVariable) || null;
      } else if (currentBlock.conditionalNext) {
        nextBlockId = evaluateConditionalNext(currentBlock.conditionalNext, state.variables, blockVariable) || null;
      }
    }

    if (nextBlockId) {
      const nextBlock = blocks[nextBlockId];
      if (nextBlock && nextBlock.showIf) {
        const shouldShow = evaluateCondition(nextBlock.showIf, state.variables);
        if (!shouldShow) {
          state.currentBlockId = nextBlockId;
          return this.getNextQuestion(session, nextBlockId, null);
        }
      }
    }

    if (nextBlockId) {
      state.currentBlockId = nextBlockId;
      const nextBlock = blocks[nextBlockId];

      if (nextBlock && (nextBlock.type === "routing" || (nextBlock.type === "dynamic-message" && (!nextBlock.content || nextBlock.content === "") && nextBlock.conditionalNext))) {
        return this.getNextQuestion(session, nextBlockId, "acknowledged");
      }

      return nextBlock || null;
    }

    return null;
  }

  private calculateProgress(session: RuntimeSession): number {
    const expectedBlocks = this.getExpectedBlocks(session);
    if (expectedBlocks.length === 0) {
      return 0;
    }

    const completedCount = expectedBlocks.filter((blockId) =>
      session.state.completedBlocks.includes(blockId)
    ).length;

    const progress = Math.round((completedCount / expectedBlocks.length) * 100);
    return Math.min(progress, 100);
  }

  private getExpectedBlocks(session: RuntimeSession): string[] {
    const { state } = session;
    const mainPath = [
      "b1",   // Which hat do you wear?
      "b3",   // How did the call land?
      "b5",   // How clear is the value?
      "b6",   // Where does it click?
      "b7",   // What would block adoption?
      "b8",   // Our direction feels...
      "b9",   // Which values?
      "b10",  // Rank lead sources
      "b11",  // Name actionable paths
      "b12",  // Booth/panel message
      "b17",  // Prioritize next 90 days
      "b18",  // Anything else?
    ];

    const expectedBlocks = [...mainPath];

    const contactNeeded = !!state.variables.contact_info_needed;
    const contactConfirmed = state.variables.contact_info_confirmed === true;
    const wantsSocial = state.variables.wants_social === true;
    const wantsChat = state.variables.wants_conversations === true;

    if (contactNeeded) {
      expectedBlocks.push("b16-contact-confirm");
      if (contactConfirmed) {
        expectedBlocks.push("b16-contact-details");
      }
    }

    if (wantsSocial) {
      expectedBlocks.push("b16-social");
    }

    if (wantsChat) {
      expectedBlocks.push("b16-chat");
    }

    if (state.variables.demographics_consent === true) {
      expectedBlocks.push("b19");
    }

    return expectedBlocks;
  }

  private formatQuestionForClient(question: any, variables: Record<string, any>): any {
    const formatted = JSON.parse(JSON.stringify(question));

    const replaceVariables = (text: string): string => {
      let value = text;

      value = value.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g, (_match, varName, ifText, elseText) => {
        return variables[varName] ? ifText : elseText;
      });

      value = value.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_match, varName, ifText) => {
        return variables[varName] ? ifText : "";
      });

      value = value.replace(/\{\{(\w+)\}\}/g, (_match, varName) => {
        return variables[varName] ?? "";
      });

      return value;
    };

    if (typeof formatted.content === "string") {
      formatted.content = replaceVariables(formatted.content);
    } else if (typeof formatted.content === "object" && formatted.contentCondition) {
      const conditionResult = evaluateCondition(formatted.contentCondition.if, variables);
      const contentKey = conditionResult
        ? formatted.contentCondition.then
        : formatted.contentCondition.else;
      formatted.content = replaceVariables(formatted.content[contentKey]);
    } else if (formatted.type === "dynamic-message" && typeof formatted.content === "object") {
      let selectedContent = formatted.content.default || "Thanks for sharing!";

      if (variables.connection_type && formatted.content[variables.connection_type]) {
        selectedContent = formatted.content[variables.connection_type];
      }

      formatted.content = replaceVariables(selectedContent);
    }

    if (formatted.conditionalContent && Array.isArray(formatted.conditionalContent)) {
      let matchedContent: string | null = null;

      for (const item of formatted.conditionalContent) {
        if (item.condition === "default") {
          matchedContent = item.content;
          break;
        }
        if (evaluateCondition(item.condition, variables)) {
          matchedContent = item.content;
          break;
        }
      }

      if (matchedContent && (formatted.content === "placeholder" || formatted.content === "")) {
        formatted.content = replaceVariables(matchedContent);
      }
    }

    if (formatted.options && Array.isArray(formatted.options)) {
      formatted.options = formatted.options.map((option: any) => ({
        ...option,
        label: option.label ? replaceVariables(option.label) : option.label,
      }));
    }

    if (formatted.placeholder) {
      formatted.placeholder = replaceVariables(formatted.placeholder);
    }

    return formatted;
  }
}

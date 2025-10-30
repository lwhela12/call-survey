import React from 'react';
import VideoAutoplay from './QuestionTypes/VideoAutoplay';
import VideoAskQuestion from './QuestionTypes/VideoAskQuestion';
import QuickReply from './QuestionTypes/QuickReply';
import TextInput from './QuestionTypes/TextInput';
import SingleChoice from './QuestionTypes/SingleChoice';
import MultiChoice from './QuestionTypes/MultiChoice';
import Scale from './QuestionTypes/Scale';
import MixedMedia from './QuestionTypes/MixedMedia';
import SemanticDifferential from './QuestionTypes/SemanticDifferential';
import Ranking from './QuestionTypes/Ranking';
import YesNo from './QuestionTypes/YesNo';
import ContactForm from './QuestionTypes/ContactForm';
import Demographics from './QuestionTypes/Demographics';
const QuestionRenderer = ({ question, onAnswer, disabled = false }) => {
    switch (question.type) {
        case 'video-autoplay':
            return React.createElement(VideoAutoplay, { question: question, onComplete: onAnswer, disabled: disabled });
        case 'videoask':
            return React.createElement(VideoAskQuestion, { question: question, onAnswer: onAnswer, disabled: disabled });
        case 'quick-reply':
        case 'message-button':
            return React.createElement(QuickReply, { question: question, onAnswer: onAnswer, disabled: disabled });
        case 'text-input':
        case 'text-input-followup':
            return React.createElement(TextInput, { question: question, onAnswer: onAnswer, disabled: disabled });
        case 'single-choice':
            return React.createElement(SingleChoice, { question: question, onAnswer: onAnswer, disabled: disabled });
        case 'multi-choice':
            return React.createElement(MultiChoice, { question: question, onAnswer: onAnswer, disabled: disabled });
        case 'scale':
            return React.createElement(Scale, { question: question, onAnswer: onAnswer, disabled: disabled });
        case 'mixed-media':
            return React.createElement(MixedMedia, { question: question, onAnswer: onAnswer, disabled: disabled });
        case 'semantic-differential':
            return React.createElement(SemanticDifferential, { question: question, onAnswer: onAnswer, disabled: disabled });
        case 'ranking':
            return React.createElement(Ranking, { question: question, onAnswer: onAnswer, disabled: disabled });
        case 'yes-no':
            return React.createElement(YesNo, { question: question, onAnswer: onAnswer, disabled: disabled });
        case 'contact-form':
            return React.createElement(ContactForm, { question: question, onAnswer: onAnswer, disabled: disabled });
        case 'demographics':
            return React.createElement(Demographics, { question: question, onAnswer: onAnswer, disabled: disabled });
        case 'final-message':
        case 'dynamic-message':
            // Final and dynamic messages are handled directly in ChatInterface
            return null;
        default:
            console.warn(`Unknown question type: ${question.type}`);
            return null;
    }
};
export default QuestionRenderer;
//# sourceMappingURL=QuestionRenderer.js.map

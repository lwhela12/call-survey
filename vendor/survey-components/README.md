# @nesolagus/survey-components

Shared survey rendering components for Nesolagus engine and studio.

## Overview

This package contains all the React components needed to render Nesolagus surveys. The components are used by both:
- **Engine**: The deployed survey application (frontend)
- **Studio**: The survey builder's live preview

By sharing these components, we ensure that the studio preview looks **100% identical** to the deployed survey.

## Components

### Core Components
- `QuestionRenderer` - Main router that renders the appropriate question type
- `ChatInterface` - Survey chat layout
- `WelcomeScreen` - Initial survey screen
- `ProgressBar` - Progress indicator
- `TypingIndicator` - Loading animation

### Question Types (14 types)
- `TextInput` - Text input questions
- `SingleChoice` - Single selection questions
- `MultiChoice` - Multiple selection questions
- `Scale` - Rating scale questions
- `YesNo` - Binary yes/no questions
- `QuickReply` - Button-based replies
- `Ranking` - Rank order questions
- `SemanticDifferential` - Semantic differential scales
- `Demographics` - Demographic forms
- `ContactForm` - Contact information forms
- `MixedMedia` - Mixed media content
- `VideoAutoplay` - Video autoplay
- `VideoAskQuestion` - VideoAsk integration
- `VideoRecorder` - Video recording
- `FinalMessage` - Final/completion message

## Installation

```bash
# From engine or studio directory
npm install @nesolagus/survey-components
```

## Usage

```tsx
import { QuestionRenderer, Question } from '@nesolagus/survey-components';

function SurveyPreview({ question }: { question: Question }) {
  const handleAnswer = (answer: any) => {
    console.log('Answer:', answer);
  };

  return (
    <QuestionRenderer
      question={question}
      onAnswer={handleAnswer}
      disabled={false}
    />
  );
}
```

## Styling

These components use `styled-components` for styling. Make sure your application has styled-components installed and a theme provider configured.

## Development

```bash
# Build package
npm run build

# Watch mode
npm run dev
```

## License

MIT

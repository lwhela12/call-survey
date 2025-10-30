import React from 'react';
import { DragEndEvent } from '@dnd-kit/core';
export declare const DragStateContext: React.Context<{
    activeId: string | null;
    setActiveDragItem: (item: any) => void;
    setDragHandlers: (handlers: {
        onDragEnd: (event: DragEndEvent) => void;
    }) => void;
}>;
declare const ChatInterface: React.FC;
export default ChatInterface;
//# sourceMappingURL=ChatInterface.d.ts.map

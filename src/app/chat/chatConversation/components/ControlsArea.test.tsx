import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import type { ChatPhase } from '@/app/chat/chatConversation/chatReducer';

import ControlsArea from './ControlsArea';

const mockHandlers = {
  onStartListening: vi.fn(),
  onStopListeningToSend: vi.fn(),
  onStopListeningToEdit: vi.fn(),
  onEvaluationRequested: vi.fn(),
  onEndSessionRequested: vi.fn(),
  onCancelListening: vi.fn(),
  onCancelEditing: vi.fn(),
  onStopEditingToSend: vi.fn(),
  onSendAfterEditCancelled: vi.fn(),
  onEditAfterEditCancelled: vi.fn(),
  onCancelAfterEditCancelled: vi.fn(),
};

describe('ControlsArea', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('aiTurnStage', () => {
    describe('status readyForUserStart', () => {
      const phase: ChatPhase = { status: 'readyForUserStart' };
      let user: ReturnType<typeof userEvent.setup>;

      beforeEach(() => {
        user = userEvent.setup();
        renderControlsArea(phase);
      });

      it('renders start button and calls correct handler', async () => {
        const startButton = screen.getByRole('button', { name: /Start conversation/i });
        expect(startButton).toBeInTheDocument();
        await user.click(startButton);
        expect(mockHandlers.onStartListening).toHaveBeenCalledOnce();
      });

      it('renders disabled evaluate button', () => {
        const evaluateButton = screen.getByRole('button', { name: /evaluate/i });
        expect(evaluateButton).toBeInTheDocument();
        expect(evaluateButton).toBeDisabled();
      });

      it('renders end session button and calls correct handler', async () => {
        const endSessionButton = screen.getByRole('button', { name: /end session/i });
        expect(endSessionButton).toBeInTheDocument();

        await user.click(endSessionButton);
        expect(mockHandlers.onEndSessionRequested).toHaveBeenCalledOnce();
      });

      it('renders no other buttons', () => {
        expect(screen.queryAllByRole('button')).toHaveLength(3);
      });
    }); // readyForUserStart

    describe('waitingForAI', () => {
      const phase: ChatPhase = { status: 'waitingForAI' };
      let user: ReturnType<typeof userEvent.setup>;

      beforeEach(() => {
        user = userEvent.setup();
        renderControlsArea(phase);
      });

      it('renders disabled reply button', async () => {
        const replyButton = screen.getByRole('button', { name: /reply/i });
        expect(replyButton).toBeInTheDocument();
        expect(replyButton).toBeDisabled();
      });

      it('renders disabled evaluate button', () => {
        const evaluateButton = screen.getByRole('button', { name: /evaluate/i });
        expect(evaluateButton).toBeInTheDocument();
        expect(evaluateButton).toBeDisabled();
      });

      it('renders end session button and calls correct handler', async () => {
        const endSessionButton = screen.getByRole('button', { name: /end session/i });
        expect(endSessionButton).toBeInTheDocument();

        await user.click(endSessionButton);
        expect(mockHandlers.onEndSessionRequested).toHaveBeenCalledOnce();
      });

      it('renders no other buttons', () => {
        expect(screen.queryAllByRole('button')).toHaveLength(3);
      });
    }); // waitingForAI
  }); // aiTurnStage

  describe('userEditStage', () => {
    const phase: ChatPhase = { status: 'editingUserReply', userMessage: 'mock user message' };
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
      user = userEvent.setup();
      renderControlsArea(phase);
    });

    it('renders send button and calls correct handler', async () => {
      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).toBeInTheDocument();

      await user.click(sendButton);
      expect(mockHandlers.onStopEditingToSend).toHaveBeenCalledOnce();
    });

    it('renders disabled edit button', () => {
      const editButton = screen.getByRole('button', { name: /^edit$/i });
      expect(editButton).toBeInTheDocument();
      expect(editButton).toBeDisabled();
    });

    it('renders cancel edit button and calls correct handler', async () => {
      const cancelEditButton = screen.getByRole('button', { name: /cancel edit/i });
      expect(cancelEditButton).toBeInTheDocument();

      await user.click(cancelEditButton);
      expect(mockHandlers.onCancelEditing).toHaveBeenCalledOnce();
    });

    it('renders no other buttons', () => {
      expect(screen.queryAllByRole('button')).toHaveLength(3);
    });
  }); // userEditStage

  describe('endSession stage', () => {
    it('does not render any buttons', () => {
      const phase: ChatPhase = { status: 'sessionEndRequested' };
      renderControlsArea(phase);
      const buttons = screen.queryAllByRole('button');
      expect(buttons).toHaveLength(0);
    });
  });
});

function renderControlsArea(phase: ChatPhase, messageCount = 0) {
  render(<ControlsArea phase={phase} messageCount={messageCount} {...mockHandlers} />);
}

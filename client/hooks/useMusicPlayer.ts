// hooks/useMusicPlayer.ts
import { useState, useRef, useEffect, useCallback } from 'react';
import { PlayerState, IdleState, PlayerContext } from '../utils/PlayerStates';

export function useMusicPlayer() {
  // Trạng thái dùng để ép React re-render (Lưu tên trạng thái hiện tại)
  const [uiStateName, setUiStateName] = useState<string>("Idle");
  
  // Tham chiếu đến thẻ <audio> thật trong DOM
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Tạo Context Object để truyền vào các State OOP
  const contextRef = useRef<PlayerContext>({
    audioElement: null,
    setState: (newState: PlayerState) => {
      // Cập nhật State object hiện tại
      currentStateRef.current = newState;
      // Báo cho React biết để cập nhật giao diện
      contextRef.current.notifyUI();
    },
    notifyUI: () => {} // Sẽ được gán lại ở dưới
  });

  // Lưu trữ instance của OOP State hiện tại (Mặc định là Idle)
  const currentStateRef = useRef<PlayerState>(new IdleState(contextRef.current));

  // Gán hàm notifyUI để trigger re-render
  useEffect(() => {
    contextRef.current.notifyUI = () => {
      setUiStateName(currentStateRef.current.getStateName());
    };
  }, []);

  // Các hàm tiện ích để Component gọi
  const play = useCallback((audioUrl?: string) => {
    currentStateRef.current.play(audioUrl);
  }, []);

  const pause = useCallback(() => {
    currentStateRef.current.pause();
  }, []);

  const stop = useCallback(() => {
    currentStateRef.current.stop();
  }, []);

  return {
    uiStateName, // Dùng để quyết định render nút Play hay Pause trên UI
    audioRef: (el: HTMLAudioElement) => { contextRef.current.audioElement = el; },
    play,
    pause,
    stop
  };
}
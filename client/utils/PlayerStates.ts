// utils/PlayerStates.ts

// 1. Interface cốt lõi cho mọi trạng thái
export abstract class PlayerState {
  protected context: PlayerContext;

  constructor(context: PlayerContext) {
    this.context = context;
  }

  abstract play(audioUrl?: string): void;
  abstract pause(): void;
  abstract stop(): void;
  abstract getStateName(): string; // Phục vụ hiển thị UI
}

// 2. Interface cho Context (Bộ điều khiển chính)
export interface PlayerContext {
  setState(state: PlayerState): void;
  audioElement: HTMLAudioElement | null;
  notifyUI(): void; // Hàm gọi để báo React re-render
}

// --- CÁC TRẠNG THÁI CỤ THỂ ---

export class IdleState extends PlayerState {
  getStateName() { return "Idle"; }

  play(audioUrl?: string) {
    if (!audioUrl || !this.context.audioElement) return;
    
    console.log("Bắt đầu chuẩn bị bài hát...");
    this.context.audioElement.src = audioUrl;
    this.context.setState(new PreparingState(this.context));
    
    // Yêu cầu trình duyệt tải và phát (Trả về một Promise)
    this.context.audioElement.play()
      .then(() => {
        // Tải xong và bắt đầu phát thành công
        this.context.setState(new PlayingState(this.context));
      })
      .catch((err) => {
        // BỎ QUA LỖI NGẮT QUÃNG: 
        // Xảy ra khi người dùng bấm Next/Stop quá nhanh khi nhạc chưa kịp tải xong
        if (err.name === 'AbortError') {
          console.log("Tiến trình phát bị gián đoạn do có thao tác mới (Bỏ qua lỗi này).");
          return; 
        }

        // Chỉ xử lý các lỗi thực sự (ví dụ: link nhạc hỏng, mất mạng)
        console.error("Lỗi phát nhạc:", err);
        this.context.setState(new ErrorState(this.context));
      });
  }

  pause() { console.log("Chưa có nhạc để tạm dừng."); }
  stop() { console.log("Đã dừng sẵn."); }
}

export class PreparingState extends PlayerState {
  getStateName() { return "Preparing"; }

  play() { console.log("Đang tải dữ liệu, vui lòng đợi..."); }
  pause() { console.log("Không thể tạm dừng khi đang tải."); }
  stop() {
    if (this.context.audioElement) {
      this.context.audioElement.pause();
      this.context.audioElement.currentTime = 0;
    }
    this.context.setState(new IdleState(this.context));
  }
}

export class PlayingState extends PlayerState {
  getStateName() { return "Playing"; }

  play() { console.log("Nhạc đang phát rồi."); }
  pause() {
    if (this.context.audioElement) {
      this.context.audioElement.pause();
    }
    this.context.setState(new PausedState(this.context));
  }
  stop() {
    if (this.context.audioElement) {
      this.context.audioElement.pause();
      this.context.audioElement.currentTime = 0;
    }
    this.context.setState(new IdleState(this.context));
  }
}

export class PausedState extends PlayerState {
  getStateName() { return "Paused"; }

  play() {
    if (this.context.audioElement) {
      this.context.audioElement.play();
    }
    this.context.setState(new PlayingState(this.context));
  }
  pause() { console.log("Nhạc đang tạm dừng rồi."); }
  stop() {
    if (this.context.audioElement) {
      this.context.audioElement.currentTime = 0;
    }
    this.context.setState(new IdleState(this.context));
  }
}

export class ErrorState extends PlayerState {
  getStateName() { return "Error"; }

  play(audioUrl?: string) {
    console.log("Thử lại...");
    
    // 1. Tạo trạng thái Idle mới
    const idleState = new IdleState(this.context);
    
    // 2. Chuyển ngữ cảnh sang trạng thái mới
    this.context.setState(idleState);
    
    // 3. Gọi trực tiếp hàm play() của trạng thái vừa tạo
    if (audioUrl) {
      idleState.play(audioUrl);
    }
  }
  
  pause() {}
  
  stop() {
    this.context.setState(new IdleState(this.context));
  }
}
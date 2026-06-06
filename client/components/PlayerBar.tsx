"use client";
import { useEffect } from 'react';
import { useMusicPlayer } from '../hooks/useMusicPlayer';

interface Song {
  song_id: string;
  title: string;
  artist: string;
  audio_url: string;
  image_url: string;
}

interface PlayerBarProps {
  currentSong: Song | null;
  onNext: () => void;
  onPrev: () => void;
}

export default function PlayerBar({ currentSong, onNext, onPrev }: PlayerBarProps) {
  const { uiStateName, audioRef, play, pause, stop } = useMusicPlayer();

  // Tự động phát nhạc khi chọn bài hát mới từ danh sách
  useEffect(() => {
    if (currentSong) {
      stop(); 
      
      // Xử lý ghép tên miền server nếu đường dẫn là tương đối (bắt đầu bằng /)
      const fullAudioUrl = currentSong.audio_url.startsWith('http') 
        ? currentSong.audio_url 
        : `http://localhost:5000${currentSong.audio_url}`;
        
      play(fullAudioUrl); 
    }
  }, [currentSong, play, stop]);

  if (!currentSong) return null; // Ẩn thanh player nếu chưa chọn bài

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-900 border-t border-gray-800 text-white p-3 md:p-4 shadow-lg z-50">
      {/* Thẻ audio ẩn, được quản lý hoàn toàn bởi State Pattern */}
      <audio ref={audioRef} />

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* 1. Thông tin bài hát */}
        <div className="flex items-center gap-3 w-1/3">
          {/* Ảnh bìa */}
          <div className="w-12 h-12 bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
             {/* Note: Trong thực tế bạn dùng thẻ <Image /> của Next.js */}
            <img 
              src={currentSong.image_url.startsWith('http') ? currentSong.image_url : `http://localhost:5000${currentSong.image_url}`} 
              alt={currentSong.title} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="hidden md:block truncate">
            <h4 className="font-bold text-sm truncate">{currentSong.title}</h4>
            <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
          </div>
        </div>

        {/* 2. Cụm nút điều khiển trung tâm */}
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={onPrev} className="text-gray-400 hover:text-white transition">
              ⏮
            </button>
            
            {/* Nút Play/Pause linh hoạt theo UI State */}
            {uiStateName === "Playing" ? (
              <button 
                onClick={() => pause()} 
                className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-full hover:bg-gray-200 transition"
                title="Tạm dừng"
              >
                ⏸
              </button>
            ) : (
              <button 
                onClick={() => play()} 
                disabled={uiStateName === "Preparing"}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition ${
                  uiStateName === "Preparing" 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-black hover:bg-gray-200'
                }`}
                title={uiStateName === "Preparing" ? "Đang tải..." : "Phát"}
              >
                {uiStateName === "Preparing" ? "⏳" : "▶"}
              </button>
            )}

            <button onClick={onNext} className="text-gray-400 hover:text-white transition">
              ⏭
            </button>
            
            <button onClick={() => stop()} className="hidden md:block text-gray-400 hover:text-red-500 transition ml-2">
              ⏹
            </button>
          </div>

          {/* Thanh Seekbar giả lập (Sẽ xử lý logic ở Giờ 5) */}
          <div className="w-full max-w-md flex items-center gap-2 mt-2 text-xs text-gray-400">
            <span>00:00</span>
            <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-0"></div>
            </div>
            <span>--:--</span>
          </div>
        </div>

        {/* 3. Hiển thị trạng thái State Pattern góc phải */}
        <div className="w-1/3 text-right hidden md:block">
          <span className="text-xs px-2 py-1 bg-gray-800 rounded-md border border-gray-700 text-green-400">
            State: {uiStateName}
          </span>
        </div>

      </div>
    </div>
  );
}
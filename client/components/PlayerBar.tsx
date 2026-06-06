"use client";
import { useEffect, useState } from 'react';
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

// Hàm chuyển đổi giây thành định dạng MM:SS
const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export default function PlayerBar({ currentSong, onNext, onPrev }: PlayerBarProps) {
  const { uiStateName, audioRef, play, pause, stop, seek } = useMusicPlayer();
  
  // State mới để quản lý thời gian và tiến trình bài hát
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Tự động phát nhạc khi đổi bài
  useEffect(() => {
    if (currentSong) {
      stop(); 
      const fullAudioUrl = currentSong.audio_url.startsWith('http') 
        ? currentSong.audio_url 
        : `http://localhost:5000${currentSong.audio_url}`;
      play(fullAudioUrl); 
    }
  }, [currentSong, play, stop]);

  // Hàm xử lý khi người dùng kéo thanh Seekbar để tua nhạc
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newTime = Number(e.target.value);
  
  seek(newTime);           // Gọi hàm seek từ Hook để tua nhạc
  setCurrentTime(newTime); // Cập nhật lại UI để thanh chạy di chuyển theo
};

  if (!currentSong) return null; 

  // Tính phần trăm hoàn thành để tô màu thanh tiến trình
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-900 border-t border-gray-800 text-white p-3 md:p-4 shadow-lg z-50">
      
      {/* Thẻ audio ẩn - Đã cập nhật thêm các sự kiện:
        - onTimeUpdate: Lấy thời gian hiện tại liên tục
        - onLoadedMetadata: Lấy tổng độ dài bài hát khi vừa tải xong
        - onEnded: Tự động gọi hàm chuyển bài tiếp theo khi hết nhạc
      */}
      <audio 
        ref={audioRef} 
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={onNext} 
      />

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* 1. Thông tin bài hát */}
        <div className="flex items-center gap-3 w-1/3">
          <div className="w-12 h-12 bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
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

        {/* 2. Cụm nút điều khiển & Seekbar */}
        <div className="flex flex-col items-center justify-center flex-1 w-full max-w-md">
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={onPrev} className="text-gray-400 hover:text-white transition">⏮</button>
            
            {uiStateName === "Error" ? (
              <button disabled className="w-10 h-10 flex items-center justify-center bg-red-600 text-white rounded-full cursor-not-allowed">⚠</button>
            ) : uiStateName === "Playing" ? (
              <button onClick={() => pause()} className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-full hover:bg-gray-200 transition">⏸</button>
            ) : (
              <button 
                onClick={() => play()} 
                disabled={uiStateName === "Preparing"}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition ${uiStateName === "Preparing" ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200'}`}
              >
                {uiStateName === "Preparing" ? "⏳" : "▶"}
              </button>
            )}

            <button onClick={onNext} className="text-gray-400 hover:text-white transition">⏭</button>
          </div>

          {/* Thanh Seekbar có thể tương tác */}
          <div className="w-full flex items-center gap-3 mt-2 text-xs text-gray-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            
            <div className="flex-1 relative flex items-center">
              {/* Lớp nền màu xanh báo hiệu phần nhạc đã phát */}
              <div 
                className="absolute left-0 h-1.5 bg-blue-500 rounded-full pointer-events-none"
                style={{ width: `${progressPercent}%` }}
              />
              {/* Thẻ input range dùng để kéo thả (tua nhạc) */}
              <input 
                type="range" 
                min={0} 
                max={duration || 0} 
                value={currentTime} 
                onChange={handleSeek}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer absolute top-0 left-0 opacity-0 z-10"
                style={{ height: '100%' }}
              />
            </div>
            
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* 3. Hiển thị trạng thái */}
        <div className="w-1/3 text-right hidden md:block">
          <span className="text-xs px-2 py-1 bg-gray-800 rounded-md border border-gray-700 text-green-400 font-mono">
            STATE: {uiStateName}
          </span>
        </div>

      </div>
    </div>
  );
}
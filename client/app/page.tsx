"use client";
import { useState, useEffect } from 'react';
import PlayerBar from '../components/PlayerBar';

// Định nghĩa kiểu dữ liệu cho bài hát (khớp với bảng CSDL)
interface Song {
  song_id: string;
  title: string;
  artist: string;
  audio_url: string;
  image_url: string;
}

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState(true);

  // Hàm gọi API lấy danh sách bài hát từ Express Backend
  const fetchSongs = async (query = "") => {
    setIsLoading(true);
    try {
      const endpoint = query 
        ? `http://localhost:5000/api/songs?search=${encodeURIComponent(query)}` 
        : 'http://localhost:5000/api/songs';
        
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.success) {
        setSongs(data.data);
        setCurrentIndex(-1); // Reset lại bài hát đang phát khi có danh sách mới
      }
    } catch (error) {
      console.error("Không thể kết nối đến server:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Tự động lấy toàn bộ bài hát khi trang vừa load xong
  useEffect(() => {
    fetchSongs();
  }, []);

  // Xử lý khi người dùng bấm nút Tìm kiếm
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSongs(searchTerm);
  };

  // Các hàm điều khiển trình phát
  const handleSelectSong = (index: number) => setCurrentIndex(index);
  
  const handleNext = () => {
    if (currentIndex === -1 || songs.length === 0) return;
    const nextIndex = currentIndex === songs.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(nextIndex);
  };

  const handlePrev = () => {
    if (currentIndex === -1 || songs.length === 0) return;
    const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
  };

  const currentSong = currentIndex !== -1 ? songs[currentIndex] : null;

  return (
    <main className="min-h-screen bg-black text-white pb-32">
      <div className="max-w-4xl mx-auto p-6">
        
        {/* Tiêu đề & Form tìm kiếm */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-800 pb-4 gap-4">
          <h1 className="text-3xl font-bold">Kho Nhạc Của Bạn</h1>
          
          <form onSubmit={handleSearch} className="flex w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Nhập tên bài hoặc ca sĩ..."
              className="px-4 py-2 rounded-l-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500 w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-md transition font-semibold"
            >
              Tìm
            </button>
          </form>
        </div>
        
        {/* Trạng thái tải dữ liệu */}
        {isLoading ? (
          <div className="text-center text-gray-400 py-10">Đang tải dữ liệu...</div>
        ) : songs.length === 0 ? (
          <div className="text-center text-gray-400 py-10">Không tìm thấy bài hát nào!</div>
        ) : (
          /* Danh sách bài hát */
          <div className="flex flex-col gap-2">
            {songs.map((song, index) => (
              <div 
                key={song.song_id}
                onClick={() => handleSelectSong(index)}
                className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition ${
                  currentIndex === index ? 'bg-gray-800 border border-gray-700' : 'hover:bg-gray-900'
                }`}
              >
                <div className="w-12 h-12 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                  <img 
                    src={song.image_url.startsWith('http') ? song.image_url : `http://localhost:5000${song.image_url}`} 
                    alt={song.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold truncate ${currentIndex === index ? 'text-blue-400' : 'text-white'}`}>
                    {song.title}
                  </h3>
                  <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                </div>

                <div className="text-gray-500 text-sm hidden md:block">
                  {song.song_id}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Thanh phát nhạc cố định */}
      <PlayerBar 
        currentSong={currentSong} 
        onNext={handleNext} 
        onPrev={handlePrev} 
      />
    </main>
  );
}
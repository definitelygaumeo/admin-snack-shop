import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Đăng ký các thành phần cần thiết
export const registerChartJS = () => {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,  // Quan trọng: PointElement cần được đăng ký
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
  );
};
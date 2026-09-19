import { ref, onMounted } from 'vue';

export function useTheme() {
  const isDarkMode = ref(true);

  const applyTheme = (dark: boolean) => {
    isDarkMode.value = dark;
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  };

  const toggleTheme = () => {
    applyTheme(!isDarkMode.value);
  };

  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      isDarkMode.value = false;
      document.documentElement.classList.remove('dark');
    } else if (savedTheme === 'dark') {
      isDarkMode.value = true;
      document.documentElement.classList.add('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      isDarkMode.value = true;
      document.documentElement.classList.add('dark');
    } else {
      isDarkMode.value = false;
      document.documentElement.classList.remove('dark');
    }
  };

  onMounted(initTheme);

  return { isDarkMode, applyTheme, toggleTheme, initTheme };
}

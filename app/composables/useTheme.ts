import { ref, watch, onMounted } from "vue";
import { useSettings } from "~/composables/useSettings";

export type Theme = "light" | "dark" | "system";
const THEME_KEY = "theme";

export function useTheme() {
    const theme = ref<Theme>("light");
    const { userSettings } = useSettings();

    const applyTheme = (themeValue: Theme) => {
        const html = document.documentElement;
        html.classList.remove("dark"); // reset first

        if (themeValue === "dark") {
            html.classList.add("dark");
        } else if (themeValue === "system") {
            const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            if (isDark) html.classList.add("dark");
        }
    };


    const setTheme = (value: Theme) => {
        theme.value = value;
        applyTheme(value);

        // Update localStorage
        localStorage.setItem(THEME_KEY, value);

        // Update userSettings reactively
        if (userSettings.value) {
            userSettings.value.theme = value;
        }
    };

    const loadTheme = () => {
        // Priority: userSettings.theme > localStorage > default
        if (userSettings.value?.theme) {
            theme.value = userSettings.value.theme as Theme;
        } else {
            const stored = localStorage.getItem(THEME_KEY) as Theme;
            if (stored) theme.value = stored;
        }
        applyTheme(theme.value);
    };

    onMounted(() => {
        loadTheme();

        // React to changes in userSettings.theme (live updates)
        watch(
            () => userSettings.value?.theme,
            (newTheme) => {
                if (newTheme && newTheme !== theme.value) {
                    theme.value = newTheme as Theme;
                    applyTheme(newTheme as Theme);
                }
            },
            { immediate: true }
        );

        // System preference changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        mediaQuery.addEventListener("change", () => {
            if (theme.value === "system") applyTheme("system");
        });
    });

    return { theme, setTheme };
}

"use client"

import { createContext, useContext, useState, useEffect } from "react"

// if not wrapped then it will return this
// basically mimics our original state
const ThemeContext = createContext({
	theme: 'system',
	setTheme: () => null
})

export default function ThemeProvider({ children, defaultTheme='system', key='simply-note-theme', ...props }) {

	const [theme, setTheme] = useState(defaultTheme)

	// // once mounted we can set the saved theme
	useEffect(() => {
		const localTheme = localStorage.getItem(key)

		if(localTheme) setTheme(localTheme)

	}, [key])

	useEffect(() => {
		const html = document.documentElement
		html.classList.remove('dark', 'light')

		if(theme==='system') {
			const sysTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark' : 'light'
			html.classList.add(sysTheme)
			html.style.colorScheme=sysTheme
			return;
		}

			html.classList.add(theme)
			html.style.colorScheme=theme

	}, [theme])

	return (
	<ThemeContext.Provider
	{...props}
	value={{
		theme,
		setTheme: (value) => {
			localStorage.setItem(key, value)
			setTheme(value)
		}
	}}>
		{children}
	</ThemeContext.Provider>
	)
}

export function useTheme() {
	const objects = useContext(ThemeContext)
	return objects
}

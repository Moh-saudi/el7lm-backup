/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			cairo: [
  				'var(--font-cairo)',
  				'Cairo',
  				'sans-serif'
  			],
  			inter: [
  				'var(--font-inter)',
  				'Inter',
  				'ui-sans-serif',
  				'system-ui',
  				'sans-serif'
  			],
  			sans: [
  				'var(--font-cairo)',
  				'Cairo',
  				'ui-sans-serif',
  				'system-ui',
  				'sans-serif'
  			],
  			arabic: [
  				'var(--font-cairo)',
  				'Cairo',
  				'sans-serif'
  			],
  			english: [
  				'var(--font-inter)',
  				'Inter',
  				'ui-sans-serif',
  				'system-ui',
  				'sans-serif'
  			],
  			'noto-arabic': [
  				'var(--font-cairo)',
  				'Cairo',
  				'sans-serif'
  			],
  			'ibm-arabic': [
  				'var(--font-cairo)',
  				'Cairo',
  				'sans-serif'
  			],
  			poppins: [
  				'var(--font-inter)',
  				'Inter',
  				'ui-sans-serif',
  				'system-ui',
  				'sans-serif'
  			],
  			tajawal: [
  				'var(--font-cairo)',
  				'Cairo',
  				'sans-serif'
  			]
  		},
  		animation: {
  			'fade-in': 'fade-in 0.6s ease-out forwards',
  			'fade-in-delayed': 'fade-in-delayed 8s ease-out forwards',
  			'loading-bar': 'loading-bar 2s ease-in-out infinite',
  			'orbit-1': 'orbit-1 2s linear infinite',
  			'orbit-2': 'orbit-2 2s linear infinite',
  			'orbit-3': 'orbit-3 2s linear infinite'
  		},
  		keyframes: {
  			'fade-in': {
  				from: {
  					opacity: '0',
  					transform: 'translateY(10px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'fade-in-delayed': {
  				'0%, 80%': {
  					opacity: '0',
  					transform: 'translateY(10px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'loading-bar': {
  				'0%': {
  					transform: 'translateX(-100%)'
  				},
  				'50%': {
  					transform: 'translateX(0%)'
  				},
  				'100%': {
  					transform: 'translateX(100%)'
  				}
  			},
  			'orbit-1': {
  				'0%': {
  					transform: 'translate(-50%, -50%) rotate(0deg) translateX(30px) rotate(0deg)'
  				},
  				'100%': {
  					transform: 'translate(-50%, -50%) rotate(360deg) translateX(30px) rotate(-360deg)'
  				}
  			},
  			'orbit-2': {
  				'0%': {
  					transform: 'translate(-50%, -50%) rotate(120deg) translateX(25px) rotate(-120deg)'
  				},
  				'100%': {
  					transform: 'translate(-50%, -50%) rotate(480deg) translateX(25px) rotate(-480deg)'
  				}
  			},
  			'orbit-3': {
  				'0%': {
  					transform: 'translate(-50%, -50%) rotate(240deg) translateX(20px) rotate(-240deg)'
  				},
  				'100%': {
  					transform: 'translate(-50%, -50%) rotate(600deg) translateX(20px) rotate(-600deg)'
  				}
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

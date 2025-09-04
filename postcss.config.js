module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // Temporarily disabled cssnano for Vercel build
    // ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {})
  },
}

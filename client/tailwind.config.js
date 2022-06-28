module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#ebdbc3",
        "dark-primary": "#deccb2",
        "black-primary": "#90816b",
        "secondary": "#03734b",
        "tertiary": "#ffb2c2",
        "myblack": "#0b2a2b",
        "myred": "#f92304",
        "myblue": "#a8eaf5",
        "mydarkblue": "#0a899e"
      },
      fontFamily:{
        Recoleta:['Recoleta', 'sans-serif']
      },
      screens:{
        "mobile-M":"375px",
        "mobile-L":"425px"
      },
      keyframes: {
        appear : {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        horizontal: {
          '0%': {transform: 'translateX(0)'},
          '100%': {transform: 'translateX(15rem)'}
        },
        reverseHorizontal:{
          '0%': {transform: 'translateX(0)'},
          '100%': {transform: '-translateX(15rem)'}
        },
        widthGrow:{
          '0%': {width: 0},
          '100%': {transform: '15rem'}
        }
      },
      animation: {
        appear : 'appear 0.33s linear',
        horizontal: 'horizontal 0.33s linear',
        reverseHorizontal: 'reverseHorizontal 0.33s linear',
        widthGrow: 'widthGrow 0.33s linear',
      }
    },
  },
  plugins: [],
}

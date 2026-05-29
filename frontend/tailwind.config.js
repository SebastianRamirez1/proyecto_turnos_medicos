/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* IBM Carbon Design System — color tokens
           https://carbondesignsystem.com/elements/color/tokens */
        carbon: {
          'blue-10':  '#edf5ff',
          'blue-60':  '#0f62fe',  /* $interactive-01 */
          'blue-70':  '#0043ce',  /* $hover-primary   */
          'blue-80':  '#002d9c',  /* $active-primary  */

          'gray-10':  '#f4f4f4',  /* $ui-01 / page bg  */
          'gray-20':  '#e0e0e0',  /* $ui-03 / border   */
          'gray-30':  '#c6c6c6',  /* $ui-04 subtle     */
          'gray-50':  '#8d8d8d',  /* $text-placeholder */
          'gray-70':  '#525252',  /* $text-02          */
          'gray-80':  '#393939',  /* $text-secondary   */
          'gray-90':  '#262626',  /* $shell hover      */
          'gray-100': '#161616',  /* $text-01 / shell  */

          'red-10':   '#fff1f1',
          'red-60':   '#da1e28',  /* $danger-01        */
          'green-10': '#defbe6',
          'green-50': '#198038',  /* $support-success  */
          'yellow-10':'#fcf4d6',
          'yellow-40':'#f1c21b',  /* $support-warning  */
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

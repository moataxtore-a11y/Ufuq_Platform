import SiteHeader from './SiteHeader.jsx'
import SiteFooter from './SiteFooter.jsx'

export default function SiteLayout({ children }) {
  return (
    <div className="flex flex-col bg-[rgb(252,249,244)] dark:bg-[#121212] min-h-screen overflow-x-hidden text-slate-800 dark:text-slate-100">
      <SiteHeader />
      <main className="flex-1 mx-auto px-3 sm:px-5 lg:px-6 pt-[68px] sm:pt-[72px] md:pt-[76px] pb-8 w-full max-w-6xl">{children}</main>
      <SiteFooter />
    </div>
  )
}

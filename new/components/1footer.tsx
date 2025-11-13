export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16 px-8">
      <div className="max-w-7xl mx-auto">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Logo and main navigation */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-6">
              <img src="/logo.png" alt="ASR Aviation" className="w-12 h-12 mr-3" />
            </div>
            <nav className="space-y-3">
              <a href="#" className="block text-gray-300 hover:text-yellow-400 transition-colors">
                Home
              </a>
              <a href="#" className="block text-gray-300 hover:text-yellow-400 transition-colors">
                Fleet
              </a>
              <a href="#" className="block text-gray-300 hover:text-yellow-400 transition-colors">
                About Us
              </a>
              <a href="#" className="block text-gray-300 hover:text-yellow-400 transition-colors">
                Contact Us
              </a>
            </nav>
          </div>

          {/* Secondary navigation */}
          <div className="md:col-span-1">
            <nav className="space-y-3 pt-16">
              <a href="#" className="block text-gray-300 hover:text-yellow-400 transition-colors">
                FAQ
              </a>
              <a href="#" className="block text-gray-300 hover:text-yellow-400 transition-colors">
                Contact Us
              </a>
              <a href="#" className="block text-gray-300 hover:text-yellow-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="block text-gray-300 hover:text-yellow-400 transition-colors">
                Terms and condition
              </a>
            </nav>
          </div>

          {/* Contact information and branding */}
          <div className="md:col-span-1 text-center">
            <div className="mb-8">
              <div className="text-yellow-400 text-4xl font-bold tracking-wider mb-2">ASR</div>
              <div className="text-yellow-400 text-lg tracking-widest">Aviation</div>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">Email: </span>
                <a href="mailto:ceo@asraviation.com" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  ceo@asraviation.com
                </a>
              </div>
              <div>
                <a
                  href="mailto:ceo.asr.aviation@gmail.com"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  ceo.asr.aviation@gmail.com
                </a>
              </div>
              <div className="mt-4">
                <span className="text-gray-400">Phone: </span>
                <a href="tel:+919829538079" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  (+91) 9829538079
                </a>
              </div>
            </div>
          </div>

          {/* Services navigation */}
          <div className="md:col-span-1">
            <nav className="space-y-3 pt-16">
              <a href="#" className="block text-gray-300 hover:text-yellow-400 transition-colors">
                Services
              </a>
              <a href="#" className="block text-gray-300 hover:text-yellow-400 transition-colors">
                Blog
              </a>
              <a href="#" className="block text-gray-300 hover:text-yellow-400 transition-colors">
                Careers
              </a>
              <a href="#" className="block text-gray-300 hover:text-yellow-400 transition-colors">
                Why Us
              </a>
            </nav>
          </div>

          {/* Social media icons */}
          <div className="md:col-span-1 flex justify-center md:justify-end items-start pt-16">
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 border border-gray-600 rounded-full flex items-center justify-center hover:border-yellow-400 hover:text-yellow-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 border border-gray-600 rounded-full flex items-center justify-center hover:border-yellow-400 hover:text-yellow-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 border border-gray-600 rounded-full flex items-center justify-center hover:border-yellow-400 hover:text-yellow-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 border border-gray-600 rounded-full flex items-center justify-center hover:border-yellow-400 hover:text-yellow-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Community section */}
        <div className="text-center mb-8">
          <p className="text-gray-300 text-lg tracking-wide">JOIN COMMUNITY TO STAY UPDATED</p>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-700">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            In case of any concern, <span className="text-white font-semibold">CONTACT US</span>
          </div>
          <div className="text-gray-400 text-sm">© 2025 ASR Aviation . All rights reserved.</div>
        </div>
      </div>
    </footer>
  )
}

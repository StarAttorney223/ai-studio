function AuthShell({ title, subtitle, children, asideTitle, asideText }) {
  return (
    <div className="min-h-screen bg-studio-bg px-4 py-8 transition-colors duration-300 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-soft dark:border-gray-700 dark:bg-gray-800 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#21113f] via-[#5e2de5] to-[#9a79ff] p-8 text-white sm:p-10">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Ether Logo"
                className="h-14 w-14 object-contain [filter:drop-shadow(0_2px_6px_rgba(0,0,0,0.2))]"
              />
              <span className="text-sm font-medium tracking-[0.22em] text-white/80">ETHER STUDIO</span>
            </div>
            <h1 className="mt-6 max-w-md text-4xl font-bold leading-tight sm:text-5xl">{asideTitle}</h1>
            <p className="mt-4 max-w-lg text-sm text-white/85 sm:text-base">{asideText}</p>
          </div>
          <div className="rounded-[1.7rem] bg-white/10 p-5 backdrop-blur">
            <p className="text-sm font-semibold">Ship content like a real SaaS team</p>
            <p className="mt-2 text-sm text-white/80">
              Draft, schedule, publish, and now manage your profile from one consistent workspace.
            </p>
          </div>
          <img
            src="/logo.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute bottom-6 right-6 w-32 object-contain opacity-10 [filter:drop-shadow(0_2px_6px_rgba(0,0,0,0.2))]"
          />
        </section>

        <section className="flex items-center p-6 sm:p-10">
          <div className="w-full">
            <div className="mb-6 flex justify-center lg:hidden">
              <img
                src="/logo.png"
                alt="Ether Logo"
                className="h-16 w-16 object-contain [filter:drop-shadow(0_2px_6px_rgba(0,0,0,0.2))] dark:[filter:none]"
              />
            </div>
            <div className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="Ether Logo"
                  className="h-12 w-12 object-contain [filter:drop-shadow(0_2px_6px_rgba(0,0,0,0.2))] dark:[filter:none]"
                />
                <span className="font-semibold text-gray-800 dark:text-white">Ether</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">{title}</h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">{subtitle}</p>
            </div>
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AuthShell;

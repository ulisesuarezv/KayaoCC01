export const SectionWrapper = ({ children, id, className = '', ref }) => (
  <section
    ref={ref}
    data-section={id}
    className={`h-screen min-h-screen w-screen overflow-hidden relative ${className}`}
  >
    {children}
  </section>
)

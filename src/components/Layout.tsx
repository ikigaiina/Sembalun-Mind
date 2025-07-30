
interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--color-background)'}}>
      <div className="max-w-md mx-auto relative">
        {children}
      </div>
    </div>
  );
};
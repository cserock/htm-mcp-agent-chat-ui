import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          [data-sonner-toast][data-type="success"] {
            background-color: rgb(240 253 244) !important;
            border-color: rgb(187 247 208) !important;
            color: rgb(22 101 52) !important;
          }
          
          [data-sonner-toast][data-type="success"] [data-title] {
            color: rgb(22 101 52) !important;
          }
          
          [data-sonner-toast][data-type="success"] [data-description] {
            color: rgb(22 101 52) !important;
          }
          
          [data-sonner-toast][data-type="error"] {
            background-color: rgb(254 242 242) !important;
            border-color: rgb(252 165 165) !important;
            color: rgb(153 27 27) !important;
          }
          
          [data-sonner-toast][data-type="error"] [data-title] {
            color: rgb(153 27 27) !important;
          }
          
          [data-sonner-toast][data-type="error"] [data-description] {
            color: rgb(153 27 27) !important;
          }
          
          [data-sonner-toast][data-type="warning"] {
            background-color: rgb(254 252 232) !important;
            border-color: rgb(252 211 77) !important;
            color: rgb(133 77 14) !important;
          }
          
          [data-sonner-toast][data-type="warning"] [data-title] {
            color: rgb(133 77 14) !important;
          }
          
          [data-sonner-toast][data-type="warning"] [data-description] {
            color: rgb(133 77 14) !important;
          }
          
          [data-sonner-toast][data-type="info"] {
            background-color: rgb(239 246 255) !important;
            border-color: rgb(147 197 253) !important;
            color: rgb(30 64 175) !important;
          }
          
          [data-sonner-toast][data-type="info"] [data-title] {
            color: rgb(30 64 175) !important;
          }
          
          [data-sonner-toast][data-type="info"] [data-description] {
            color: rgb(30 64 175) !important;
          }
          
          /* Dark mode styles */
          @media (prefers-color-scheme: dark) {
            [data-sonner-toast][data-type="success"] {
              background-color: rgb(20 83 45 / 0.2) !important;
              border-color: rgb(34 197 94) !important;
              color: rgb(187 247 208) !important;
            }
            
            [data-sonner-toast][data-type="error"] {
              background-color: rgb(127 29 29 / 0.2) !important;
              border-color: rgb(248 113 113) !important;
              color: rgb(252 165 165) !important;
            }
            
            [data-sonner-toast][data-type="warning"] {
              background-color: rgb(133 77 14 / 0.2) !important;
              border-color: rgb(251 191 36) !important;
              color: rgb(252 211 77) !important;
            }
            
            [data-sonner-toast][data-type="info"] {
              background-color: rgb(30 64 175 / 0.2) !important;
              border-color: rgb(59 130 246) !important;
              color: rgb(147 197 253) !important;
            }
          }
        `
      }} />
      <Sonner
        theme={theme as ToasterProps["theme"]}
        className="toaster group"
        toastOptions={{
          classNames: {
            toast:
              "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
            description: "group-[.toast]:text-muted-foreground",
            actionButton:
              "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium",
            cancelButton:
              "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium",
          },
        }}
        {...props}
      />
    </>
  );
};

export { Toaster };

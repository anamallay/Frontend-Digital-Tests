import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  LogOut,
  Menu,
  X,
  User,
  BookMarked,
  FileText,
  Trophy,
} from "lucide-react";
import { RootState, AppDispatch } from "../../reducer/store/store";
import { logoutUser } from "../../reducer/action/usersSlice";
import Logo from "../../assets/Icons/Logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Header = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isLoggedIn, userData } = useSelector(
    (state: RootState) => state.users
  );
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/login");
    } catch {
      // Error surfaced via state.users.error — stay logged in.
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
    // <html dir> is kept in sync by the effect in App.tsx.
  };

  const initials = userData?.username?.slice(0, 2).toUpperCase() ?? "U";
  const iconMargin = isRTL ? "ml-2" : "mr-2";

  const isActive = (path: string) => pathname === path;

  const navLinkClass = (path: string) =>
    `relative px-3 py-2 text-sm font-medium rounded-md
     outline-none focus-visible:ring-2 focus-visible:ring-primary/40
     transition-colors duration-200
     ${
       isActive(path)
         ? "text-foreground"
         : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
     }`;

  return (
    <header
      dir={isRTL ? "rtl" : "ltr"}
      className={`
        fixed top-0 left-0 w-full z-50
        animate-in fade-in slide-in-from-top-2 duration-300 ease-out
        motion-reduce:animate-none
        transition-[background-color,backdrop-filter,border-color,box-shadow]
        duration-300
        ${
          scrolled
            ? "bg-surface/75 backdrop-blur-lg border-b border-border/80 shadow-sm"
            : "bg-surface/95 backdrop-blur-sm border-b border-border/40"
        }
      `}
    >
      {/* Subtle gradient accent line — fades in only when scrolled */}
      <div
        aria-hidden="true"
        className={`absolute bottom-0 left-1/2 h-px w-3/4 -translate-x-1/2
          bg-gradient-to-r from-transparent via-primary/30 to-transparent
          transition-opacity duration-500
          ${scrolled ? "opacity-100" : "opacity-0"}`}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: logo + nav */}
          <div className="flex items-center gap-1 sm:gap-8">
            <Link
              to="/"
              aria-label={t("Header.digital_exams")}
              className="
                rounded-lg px-2 py-1 -mx-2
                outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                focus-visible:ring-offset-2 focus-visible:ring-offset-background
                transition-transform duration-200
                hover:scale-[1.02] active:scale-[0.98]
                motion-reduce:hover:scale-100 motion-reduce:active:scale-100
              "
            >
              <Logo size="md" wordmark={t("Header.digital_exams")} />
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link to="/public" className={navLinkClass("/public")}>
                {t("Header.all_public_exams")}
                {isActive("/public") && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-1 left-1/2 -translate-x-1/2
                               h-[2px] w-8 rounded-full bg-primary"
                  />
                )}
              </Link>
              <Link to="/users" className={navLinkClass("/users")}>
                {t("Header.users")}
                {isActive("/users") && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-1 left-1/2 -translate-x-1/2
                               h-[2px] w-8 rounded-full bg-primary"
                  />
                )}
              </Link>
            </nav>

            {/* Mobile menu */}
            <DropdownMenu open={mobileOpen} onOpenChange={setMobileOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={t("Header.menu")}
                  aria-expanded={mobileOpen}
                  className="
                    md:hidden relative flex h-10 w-10 items-center justify-center
                    rounded-md text-muted-foreground
                    hover:text-foreground hover:bg-muted transition-colors
                    outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                  "
                >
                  <Menu
                    className={`h-5 w-5 absolute transition-all duration-200
                      motion-reduce:transition-none ${
                        mobileOpen
                          ? "opacity-0 rotate-90 scale-75"
                          : "opacity-100 rotate-0 scale-100"
                      }`}
                    aria-hidden="true"
                  />
                  <X
                    className={`h-5 w-5 absolute transition-all duration-200
                      motion-reduce:transition-none ${
                        mobileOpen
                          ? "opacity-100 rotate-0 scale-100"
                          : "opacity-0 -rotate-90 scale-75"
                      }`}
                    aria-hidden="true"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={isRTL ? "end" : "start"}
                className="w-56"
                sideOffset={8}
              >
                <DropdownMenuItem asChild>
                  <Link to="/public" className="cursor-pointer">
                    {t("Header.all_public_exams")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/users" className="cursor-pointer">
                    {t("Header.users")}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Select value={i18n.language} onValueChange={changeLanguage}>
              <SelectTrigger
                className="h-9 w-[92px] text-sm border-border bg-transparent
                           hover:bg-muted hover:border-border/80 transition-colors"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">عربي</SelectItem>
              </SelectContent>
            </Select>

            {isLoggedIn ? (
              <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="
                      flex items-center gap-2 rounded-full py-1 px-1.5
                      hover:bg-muted transition-colors
                      outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                    "
                  >
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarFallback
                        className="bg-gradient-to-br from-primary/20 to-primary/5
                                   text-primary text-xs font-semibold"
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground hidden sm:inline px-1">
                      {userData?.username ?? t("Header.profile_user")}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform
                        duration-200 motion-reduce:transition-none ${
                          profileOpen ? "rotate-180" : ""
                        }`}
                      aria-hidden="true"
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align={isRTL ? "start" : "end"}
                  className="w-56"
                  sideOffset={8}
                >
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal truncate">
                    {userData?.email ?? t("Header.profile_user")}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/scores" className="cursor-pointer">
                      <Trophy
                        className={`h-4 w-4 ${iconMargin} text-muted-foreground`}
                        aria-hidden="true"
                      />
                      {t("Header.examiner_scores")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/quizzes" className="cursor-pointer">
                      <FileText
                        className={`h-4 w-4 ${iconMargin} text-muted-foreground`}
                        aria-hidden="true"
                      />
                      {t("Header.my_quizzes")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/library" className="cursor-pointer">
                      <BookMarked
                        className={`h-4 w-4 ${iconMargin} text-muted-foreground`}
                        aria-hidden="true"
                      />
                      {t("Header.my_library")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User
                        className={`h-4 w-4 ${iconMargin} text-muted-foreground`}
                        aria-hidden="true"
                      />
                      {t("Header.view_profile")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-danger focus:text-danger cursor-pointer"
                  >
                    <LogOut
                      className={`h-4 w-4 ${iconMargin}`}
                      aria-hidden="true"
                    />
                    {t("Header.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                size="sm"
                className="
                  h-9 px-5 rounded-lg font-medium
                  bg-gradient-to-br from-primary to-primary/85
                  text-primary-foreground
                  shadow-sm shadow-primary/10
                  hover:shadow-md hover:shadow-primary/25
                  hover:from-primary hover:to-primary
                  active:scale-[0.97]
                  transition-all duration-200
                  motion-reduce:transition-none motion-reduce:active:scale-100
                "
              >
                <Link to="/login">{t("Header.login")}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
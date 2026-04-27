import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  ChevronDown,
  LogOut,
  Menu,
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
  const { isLoggedIn, userData } = useSelector(
    (state: RootState) => state.users
  );
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/login");
    } catch {
      // Error is surfaced via `state.users.error` — we simply stay logged in.
    }
  };

const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng);
  localStorage.setItem("language", lng);
  // <html dir> is kept in sync by the effect in App.tsx.
  // `document.body.dir` was the wrong element (spec expects dir on <html>)
  // and was only set here, not on initial page load — both fixed centrally.
};

  const initials = userData?.username?.slice(0, 2).toUpperCase() ?? "U";
  const iconMargin = isRTL ? "ml-2" : "mr-2";

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      dir={isRTL ? "rtl" : "ltr"}
      className={`fixed top-0 left-0 w-full z-50 bg-surface transition-all duration-200 ${
        scrolled
          ? "border-b border-border shadow-sm"
          : "border-b border-border/60"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: logo + nav */}
          <div className="flex items-center gap-1 sm:gap-8">
            <Link
              to="/"
              className="group rounded-md px-2 py-1 -mx-2 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              <Logo
                size="md"
                wordmark={t("Header.digital_exams")}
                className="transition-transform group-hover:scale-[1.02]"
              />
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/public"
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {t("Header.all_public_exams")}
              </Link>
              <Link
                to="/users"
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {t("Header.users")}
              </Link>
            </nav>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={t("Header.menu")}
                  className="md:hidden flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <Menu className="h-5 w-5" />
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
              <SelectTrigger className="h-9 w-[92px] text-sm border-border bg-transparent hover:bg-muted transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">عربي</SelectItem>
              </SelectContent>
            </Select>

            {isLoggedIn ? (
              <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full py-1 px-1.5 hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground hidden sm:inline px-1">
                      {userData?.username ?? t("Header.profile_user")}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        open ? "rotate-180" : ""
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
                    <LogOut className={`h-4 w-4 ${iconMargin}`} aria-hidden="true" />
                    {t("Header.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                size="sm"
                className="h-9 px-5 rounded-lg font-medium bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md active:scale-[0.98] transition-all duration-200"
              >
                <Link to="/login">{t("Header.login")}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
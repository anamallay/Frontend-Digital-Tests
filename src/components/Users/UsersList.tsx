import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Users as UsersIcon, FileQuestion, CircleAlert } from "lucide-react";

import { AppDispatch, RootState } from "../../reducer/store/store";
import { fetchPublicUsers } from "../../reducer/action/publicUsersSlice";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const UsersList = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { users, isLoadingList, errorList } = useSelector(
    (state: RootState) => state.publicUsers
  );

  useEffect(() => {
    dispatch(fetchPublicUsers());
  }, [dispatch]);

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="mx-auto w-[92%] max-w-7xl px-4 pb-20 pt-28 sm:pt-32"
    >
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t("Users.title")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t("Users.subtitle")}
        </p>
      </div>

      {/* Error banner */}
      {errorList && !isLoadingList && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{errorList}</span>
        </div>
      )}

      {/* Loading skeletons */}
      {isLoadingList ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="flex items-center gap-4 p-6">
                <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="mb-2 h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : users.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <UsersIcon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            {t("Users.empty")}
          </h3>
        </div>
      ) : (
        /* Users grid */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {users.map((user, idx) => {
            const initials = (user.username || user.name || "?")
              .slice(0, 2)
              .toUpperCase();

            return (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: Math.min(idx * 0.04, 0.3),
                  ease: "easeOut",
                }}
              >
                <Card
                  onClick={() => navigate(`/users/${user._id}`)}
                  className="group relative h-full cursor-pointer border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <CardContent className="flex items-center gap-4 p-6">
                    <Avatar className="h-12 w-12 shrink-0 border border-border">
                      <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        @{user.username}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <FileQuestion className="h-3 w-3" aria-hidden="true" />
                        <span className="font-medium text-foreground">
                          {user.publicQuizzesCount}
                        </span>
                        <span>
                          {t("Users.publicExamsCount")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default UsersList;
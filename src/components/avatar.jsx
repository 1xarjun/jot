export default function Avatar({ user }) {
  return user?.user_metadata?.avatar_url ? (
    <div className="size-5 rounded-full overflow-hidden flex-shrink-0">
      <img
        className="w-full h-full rounded-full select-none object-cover"
        referrerPolicy="no-referrer"
        src={user.user_metadata.avatar_url}
        alt="user avatar"
      />
    </div>
  ) : (
    <div className="flex justify-center items-center text-white size-5 bg-gradient-to-br from-neutral-400 to-blue-950 rounded-full flex-shrink-0">
      {/* {user?.email?.charAt(0).toUpperCase() ?? "?"}*/}
    </div>
  );
}

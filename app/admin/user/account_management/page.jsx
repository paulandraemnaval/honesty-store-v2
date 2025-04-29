import { SidebarTrigger } from "@/components/ui/sidebar";
import AccountForm from "@/components/account-form";
const page = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="top-bar">
        <div className="flex">
          <SidebarTrigger />
          <span className="text-2xl font-bold ml-4">Account Management</span>
        </div>
      </div>
      <div className="px-6 py-4">
        <AccountForm />
      </div>
    </div>
  );
};

export default page;

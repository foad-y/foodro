import { useState } from "react";
// import { supabase } from '../lib/supabase';
import { usePosStore } from "../store/useProduct";
import ConfirmDelete from "../components/ConfirmDelete";
import Header from "../components/cashier/Header";
import Sidebar from "../components/cashier/Sidbar";
import MainContent from "../components/cashier/MainContent";
import DeliveredOrdersModal from "../components/DeliveredOrdersModal";
import { LoadingLine } from "./loading";
import { RefreshCcw } from "lucide-react";

export default function Cashier() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showDeliveredOrderModal, setShowDeliveredOrderModal] = useState(false);
  const isLoading = usePosStore((state) => state.isLoading);
  const clearAll = usePosStore((state) => state.clearAll);

  return (
    <div className="min-h-screen max-w-svw bg-tertiary font-sans" dir="rtl">
      <Header
        ConfirmDelete={() => setConfirmDelete(!confirmDelete)}
        SidbarOpen={() => setSidebarOpen(true)}
        openModalOrderDelivered={() => setShowDeliveredOrderModal(true)}
      />

      <div className="flex w-full h-[calc(100vh-80px)] gap-4 px-4 py-2">
        <Sidebar
          sidebarOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />
        <MainContent />
      </div>

      {confirmDelete && (
        <ConfirmDelete
          open={() => setConfirmDelete(!confirmDelete)}
          onConfirm={() => {
            clearAll();
            setConfirmDelete(false);
          }}
          description="تمام داده ها بروزرسانی میشود"
          title="بروزرسانی داده ها"
          actions={["انصراف", "بروزرسانی"]}
          icon={<RefreshCcw className="w-5 h-5" />}
          color="var(--color-warning)"
        />
      )}
      {showDeliveredOrderModal && (
        <DeliveredOrdersModal close={() => setShowDeliveredOrderModal(false)} />
      )}
      {isLoading && <LoadingLine />}
    </div>
  );
}
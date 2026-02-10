import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Mobile Navigation */}
            <MobileNav title="SVR Admin">
                <Sidebar />
            </MobileNav>

            {/* Desktop Sidebar */}
            <aside className="hidden md:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 shadow-sm z-50">
                <div className="p-6 border-b border-gray-50">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600">
                        SVR Admin
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Academic Portal</p>
                </div>
                <div className="p-4 h-[calc(100vh-85px)]">
                    <Sidebar />
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-0 md:ml-64 flex-1 p-4 md:p-8 transition-all duration-300">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

import React from 'react';
import { FileText, Download, Eye, Calendar, Users, Mail, Grid3X3, Menu } from 'lucide-react';

interface MobileLandingPageProps {
  onFileAction: (fileName: string, action: 'view' | 'download') => void;
}

const MobileLandingPage: React.FC<MobileLandingPageProps> = ({ onFileAction }) => {
  const files = [
    {
      name: "Q4 Financial Report.xlsx",
      type: "Excel",
      size: "2.4 MB",
      modified: "2h ago",
      icon: "📊"
    },
    {
      name: "Team Meeting Notes.docx",
      type: "Word",
      size: "156 KB",
      modified: "1d ago",
      icon: "📝"
    },
    {
      name: "Project Presentation.pptx",
      type: "PowerPoint",
      size: "8.7 MB",
      modified: "3d ago",
      icon: "📈"
    },
    {
      name: "Budget Analysis.pdf",
      type: "PDF",
      size: "1.2 MB",
      modified: "1w ago",
      icon: "📄"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f3f2f1]">
      {/* Mobile Top Navigation */}
      <div className="bg-[#0078d4] text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Menu className="w-5 h-5 cursor-pointer" />
            <div className="flex items-center space-x-2">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/768px-Microsoft_logo.svg.png"
                alt="Microsoft"
                className="w-5 h-5"
              />
              <span className="font-semibold text-sm">Office</span>
            </div>
          </div>
          <div className="w-7 h-7 bg-[#106ebe] rounded-full flex items-center justify-center cursor-pointer">
            <span className="text-xs font-semibold">U</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#323130] mb-1">Good afternoon</h1>
          <p className="text-sm text-[#605e5c]">Here are your recent files</p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-[#edebe9]">
            <FileText className="w-6 h-6 text-[#0078d4] mb-2" />
            <h3 className="font-semibold text-[#323130] text-sm mb-1">Create new</h3>
            <p className="text-xs text-[#605e5c]">Start document</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-[#edebe9]">
            <Mail className="w-6 h-6 text-[#0078d4] mb-2" />
            <h3 className="font-semibold text-[#323130] text-sm mb-1">Outlook</h3>
            <p className="text-xs text-[#605e5c]">Check email</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-[#edebe9]">
            <Calendar className="w-6 h-6 text-[#0078d4] mb-2" />
            <h3 className="font-semibold text-[#323130] text-sm mb-1">Calendar</h3>
            <p className="text-xs text-[#605e5c]">View schedule</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-[#edebe9]">
            <Users className="w-6 h-6 text-[#0078d4] mb-2" />
            <h3 className="font-semibold text-[#323130] text-sm mb-1">Teams</h3>
            <p className="text-xs text-[#605e5c]">Collaborate</p>
          </div>
        </div>

        {/* Recent Files */}
        <div className="bg-white rounded-lg shadow-sm border border-[#edebe9]">
          <div className="p-4 border-b border-[#edebe9]">
            <h2 className="text-lg font-semibold text-[#323130]">Recent files</h2>
          </div>
          
          <div className="divide-y divide-[#edebe9]">
            {files.map((file, index) => (
              <div key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="text-xl flex-shrink-0">{file.icon}</div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-[#323130] text-sm truncate">{file.name}</h3>
                      <p className="text-xs text-[#605e5c]">
                        {file.type} • {file.size} • {file.modified}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                    <button
                      onClick={() => onFileAction(file.name, 'view')}
                      className="p-2 hover:bg-[#edebe9] rounded-md transition-colors"
                      title="View file"
                    >
                      <Eye className="w-4 h-4 text-[#605e5c]" />
                    </button>
                    <button
                      onClick={() => onFileAction(file.name, 'download')}
                      className="p-2 hover:bg-[#edebe9] rounded-md transition-colors"
                      title="Download file"
                    >
                      <Download className="w-4 h-4 text-[#605e5c]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileLandingPage;
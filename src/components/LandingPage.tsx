import React from 'react';
import { FileText, Download, Eye, Calendar, Users, Mail, Grid3X3 } from 'lucide-react';

interface LandingPageProps {
  onFileAction: (fileName: string, action: 'view' | 'download') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onFileAction }) => {
  const files = [
    {
      name: "Q4 Financial Report.xlsx",
      type: "Excel",
      size: "2.4 MB",
      modified: "2 hours ago",
      icon: "📊"
    },
    {
      name: "Team Meeting Notes.docx",
      type: "Word",
      size: "156 KB",
      modified: "1 day ago",
      icon: "📝"
    },
    {
      name: "Project Presentation.pptx",
      type: "PowerPoint",
      size: "8.7 MB",
      modified: "3 days ago",
      icon: "📈"
    },
    {
      name: "Budget Analysis.pdf",
      type: "PDF",
      size: "1.2 MB",
      modified: "1 week ago",
      icon: "📄"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f3f2f1]">
      {/* Top Navigation */}
      <div className="bg-[#0078d4] text-white px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Grid3X3 className="w-5 h-5 cursor-pointer hover:bg-[#106ebe] p-1 rounded" />
            <div className="flex items-center space-x-2">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/768px-Microsoft_logo.svg.png"
                alt="Microsoft"
                className="w-6 h-6"
              />
              <span className="font-semibold">Office</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-[#106ebe] rounded-full flex items-center justify-center cursor-pointer">
              <span className="text-sm font-semibold">U</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#323130] mb-2">Good afternoon</h1>
          <p className="text-[#605e5c]">Here are your recent files and activities</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-[#edebe9] hover:shadow-md transition-shadow cursor-pointer">
            <FileText className="w-8 h-8 text-[#0078d4] mb-3" />
            <h3 className="font-semibold text-[#323130] mb-1">Create new</h3>
            <p className="text-sm text-[#605e5c]">Start a new document</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-[#edebe9] hover:shadow-md transition-shadow cursor-pointer">
            <Mail className="w-8 h-8 text-[#0078d4] mb-3" />
            <h3 className="font-semibold text-[#323130] mb-1">Outlook</h3>
            <p className="text-sm text-[#605e5c]">Check your email</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-[#edebe9] hover:shadow-md transition-shadow cursor-pointer">
            <Calendar className="w-8 h-8 text-[#0078d4] mb-3" />
            <h3 className="font-semibold text-[#323130] mb-1">Calendar</h3>
            <p className="text-sm text-[#605e5c]">View your schedule</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-[#edebe9] hover:shadow-md transition-shadow cursor-pointer">
            <Users className="w-8 h-8 text-[#0078d4] mb-3" />
            <h3 className="font-semibold text-[#323130] mb-1">Teams</h3>
            <p className="text-sm text-[#605e5c]">Collaborate with team</p>
          </div>
        </div>

        {/* Recent Files */}
        <div className="bg-white rounded-lg shadow-sm border border-[#edebe9]">
          <div className="p-6 border-b border-[#edebe9]">
            <h2 className="text-xl font-semibold text-[#323130]">Recent files</h2>
          </div>
          
          <div className="divide-y divide-[#edebe9]">
            {files.map((file, index) => (
              <div key={index} className="p-4 hover:bg-[#f3f2f1] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{file.icon}</div>
                    <div>
                      <h3 className="font-medium text-[#323130]">{file.name}</h3>
                      <p className="text-sm text-[#605e5c]">
                        {file.type} • {file.size} • Modified {file.modified}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
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

export default LandingPage;
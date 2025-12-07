import { useState, useEffect } from "react";
import { materialService } from "../services/materialService";
import { useUser } from "../context/UserContext";
import LearningResourcesModal from "./LearningResourcesModal";
import CreateSectionModal from "./CreateSectionModal";

export default function CourseMaterials({ courseId, isTutor }) {
    const { user } = useUser();
    const [dbMaterials, setDbMaterials] = useState([]);
    const [sections, setSections] = useState([]);
    const [dummyMaterials, setDummyMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modals state
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);

    // Track which section receives the upload (null = default "Slides")
    const [targetSectionId, setTargetSectionId] = useState(null);

    useEffect(() => {
        loadData();
    }, [courseId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [mats, secs] = await Promise.all([
                materialService.getMaterials(courseId),
                materialService.getSections(courseId)
            ]);
            setDbMaterials(mats);
            setSections(secs);
        } catch (err) {
            console.error(err);
            setError("Failed to load course content");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSection = async (title) => {
        try {
            const newSec = await materialService.createSection(courseId, title);
            setSections(prev => [...prev, newSec]);
        } catch (err) {
            console.error(err);
            alert("Failed to create section");
            throw err;
        }
    };

    const handleDeleteSection = async (sectionId) => {
        if (!window.confirm("Delete this section and all its files? This cannot be undone.")) return;
        try {
            await materialService.deleteSection(sectionId);
            setSections(prev => prev.filter(s => s.id !== sectionId));
            setDbMaterials(prev => prev.filter(m => m.section_id !== sectionId));
        } catch (err) {
            console.error(err);
            alert("Failed to delete section");
        }
    };

    // Open Upload Modal
    const openUploadModal = (sectionId) => {
        setTargetSectionId(sectionId);
        setIsUploadModalOpen(true);
    };

    const handleCustomUpload = async (file) => {
        try {
            setError(null);
            const role = isTutor ? 'tutor' : 'student';
            await materialService.uploadMaterial(file, courseId, role, targetSectionId);
            await loadData();
        } catch (err) {
            console.error(err);
            setError("Failed to upload material");
            throw err;
        }
    };

    const handleAddLibraryResource = (resource) => {
        const newDummy = {
            id: `dummy_${resource.id}_${Date.now()}`,
            course_id: courseId,
            uploader_id: user?.id,
            role: isTutor ? 'tutor' : 'student',
            file_path: resource.url,
            file_name: resource.title,
            file_size: 0,
            displaySize: resource.size,
            visibility: isTutor ? 'public' : 'private',
            created_at: new Date().toISOString(),
            isDummy: true,
            section_id: targetSectionId
        };
        setDummyMaterials(prev => [...prev, newDummy]);
        setIsUploadModalOpen(false);
    };

    const handleDeleteMaterial = async (id, filePath, isDummy) => {
        if (!window.confirm("Delete this file?")) return;

        if (isDummy) {
            setDummyMaterials(prev => prev.filter(m => m.id !== id));
            return;
        }

        try {
            await materialService.deleteMaterial(id, filePath);
            setDbMaterials(prev => prev.filter(m => m.id !== id));
        } catch (err) {
            console.error(err);
            setError("Failed to delete material");
        }
    };

    const handleDownload = async (file) => {
        if (file.isDummy) {
            window.open(file.file_path, '_blank');
            return;
        }
        try {
            const { data, error } = await materialService.getDownloadUrl(file.file_path);
            if (error) throw error;
            const link = document.createElement('a');
            link.href = data.signedUrl;
            link.download = file.file_name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error(err);
            alert("Download failed");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading contents...</div>;

    // Organization Logic
    const allMaterials = [...dbMaterials, ...dummyMaterials].sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
    );

    // Group Public Materials by Section
    const publicMaterials = allMaterials.filter(m => m.visibility === 'public');
    const sectionMaterialsMap = {};
    sections.forEach(s => {
        sectionMaterialsMap[s.id] = publicMaterials.filter(m => m.section_id === s.id);
    });
    const privateMaterials = allMaterials.filter(m => m.visibility === 'private');

    const MaterialList = ({ items }) => (
        <div className="space-y-2">
            {items.map(file => (
                <div key={file.id} className="p-4 hover:bg-gray-50 flex items-center justify-between group transition-colors border border-gray-100 rounded-lg">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${file.role === 'tutor' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                            }`}>
                            {file.role === 'tutor' ? '📄' : '👤'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-medium text-gray-900 truncate" title={file.file_name}>
                                {file.file_name} {file.isDummy && <span className="text-xs text-gray-400 bg-gray-100 px-1 rounded ml-1">Library</span>}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">
                                    {(file.file_size / 1024 / 1024).toFixed(2)} MB • {new Date(file.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleDownload(file)} className="text-gray-400 hover:text-blue-600 p-2">Download</button>
                        {(isTutor || user?.id === file.uploader_id || file.isDummy) && (
                            <button onClick={() => handleDeleteMaterial(file.id, file.file_path, file.isDummy)} className="text-gray-400 hover:text-red-600 p-2">Delete</button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header Actions */}
            <div className="flex justify-end mb-6 gap-3">
                {isTutor && (
                    <button
                        onClick={() => setIsSectionModalOpen(true)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors"
                    >
                        + New Section
                    </button>
                )}
            </div>

            {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

            {/* Student Private Materials (Moved to TOP) */}
            {!isTutor && (
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Your Materials</h2>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">{privateMaterials.length} items</span>
                            <button
                                onClick={() => openUploadModal(null)}
                                className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium"
                            >
                                + Add Material
                            </button>
                        </div>
                    </div>
                    {privateMaterials.length > 0 ? (
                        <MaterialList items={privateMaterials} />
                    ) : (
                        <p className="text-gray-500 text-sm italic">No private materials uploaded.</p>
                    )}
                </section>
            )}

            {/* Custom Sections */}
            {sections.length === 0 && isTutor && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="text-4xl mb-3">📂</div>
                    <p className="text-gray-500 mb-4">No sections created yet.</p>
                    <button
                        onClick={() => setIsSectionModalOpen(true)}
                        className="text-blue-600 font-medium hover:text-blue-700"
                    >
                        + Create your first section
                    </button>
                </div>
            )}

            {sections.map(section => (
                <section key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">
                                {sectionMaterialsMap[section.id]?.length || 0} items
                            </span>
                            {isTutor && (
                                <>
                                    <button
                                        onClick={() => openUploadModal(section.id)}
                                        className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium"
                                    >
                                        + Add Material
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSection(section.id)}
                                        className="text-sm text-red-500 hover:text-red-700 px-2"
                                        title="Delete Section"
                                    >
                                        🗑️
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    {sectionMaterialsMap[section.id]?.length > 0 ? (
                        <MaterialList items={sectionMaterialsMap[section.id]} />
                    ) : (
                        <p className="text-gray-500 text-sm italic">Empty section.</p>
                    )}
                </section>
            ))}

            <LearningResourcesModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onAddResource={handleAddLibraryResource}
                onUploadCustom={handleCustomUpload}
                addedResourceIds={dummyMaterials.map(m => m.file_path)}
            />

            <CreateSectionModal
                isOpen={isSectionModalOpen}
                onClose={() => setIsSectionModalOpen(false)}
                onCreate={handleCreateSection}
            />
        </div>
    );
}

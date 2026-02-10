import React, { useState, useEffect } from 'react';
import { db, storage } from '../../lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, where, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { FolderOpen, Upload, File, Trash2, Download } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const Files = () => {
    const { user } = useOutletContext();
    const [files, setFiles] = useState([]);
    const [projects, setProjects] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [selectedProject, setSelectedProject] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        // Fetch files
        const fSnap = await getDocs(query(collection(db, "files"), orderBy("timestamp", "desc")));
        setFiles(fSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Fetch projects for dropdown
        const pSnap = await getDocs(collection(db, "projects"));
        setProjects(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedProject) {
            alert("Please select a file and a project.");
            return;
        }

        setUploading(true);
        try {
            const storageRef = ref(storage, `files/${selectedProject}/${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            await addDoc(collection(db, "files"), {
                name: file.name,
                url: downloadURL,
                projectId: selectedProject,
                projectName: projects.find(p => p.id === selectedProject)?.projectTitle,
                uploadedBy: user.email,
                uploadedAt: new Date().toLocaleDateString(),
                timestamp: new Date(),
                size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
            });

            setUploading(false);
            e.target.value = null; // Reset input
            fetchData();
        } catch (error) {
            console.error("Upload failed:", error);
            setUploading(false);
            alert("Upload failed.");
        }
    };

    const handleDelete = async (file) => {
        if (!window.confirm("Delete this file?")) return;
        try {
            // Delete from Storage
            const fileRef = ref(storage, file.url);
            await deleteObject(fileRef).catch(err => console.log("Storage delete error (might allow only DB delete):", err));

            // Delete from Firestore
            await deleteDoc(doc(db, "files", file.id));
            fetchData();
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-black mb-2">File <span className="text-nex-purple">Manager</span></h1>
            <p className="text-gray-600 mb-8">Securely store and share project documents.</p>

            <div className="glass-card p-6 rounded-xl border border-white/10 mb-8">
                <h2 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                    <Upload size={20} className="text-nex-purple" /> Upload New File
                </h2>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm text-gray-600 mb-2">Select Project</label>
                        <select className="w-full bg-black/40 border border-white/10 rounded p-2 text-black" value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
                            <option value="">-- Select Project --</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.projectTitle}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 w-full relative">
                        <label className="block text-sm text-gray-600 mb-2">Choose File</label>
                        <input type="file" onChange={handleUpload} disabled={uploading} className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-nex-purple/10 file:text-nex-purple hover:file:bg-nex-purple/20" />
                        {uploading && <span className="absolute right-0 top-0 text-nex-purple text-xs animate-pulse">Uploading...</span>}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {files.map(file => (
                    <div key={file.id} className="glass-card p-4 rounded-lg border border-white/5 hover:border-white/20 transition-all group relative">
                        <div className="bg-nex-dark/50 p-3 rounded mb-3 flex justify-center text-4xl text-gray-500">
                            <File />
                        </div>
                        <h3 className="font-bold text-black truncate mb-1" title={file.name}>{file.name}</h3>
                        <p className="text-xs text-gray-500">{file.projectName}</p>
                        <p className="text-xs text-gray-600 mt-1">{file.size} • {file.uploadedAt}</p>

                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-nex-purple text-black rounded hover:bg-white" title="Download">
                                <Download size={14} />
                            </a>
                            <button onClick={() => handleDelete(file)} className="p-1.5 bg-red-500 text-black rounded hover:bg-red-600" title="Delete">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {files.length === 0 && <p className="text-gray-500 text-center py-8">No files uploaded yet.</p>}
        </div>
    );
};

export default Files;

import { supabase } from "../lib/supabaseClient";

export const materialService = {
    /**
     * Upload a course material
     */
    async uploadMaterial(file, courseId, role, sectionId = null) {
        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) throw new Error("User not authenticated");

            const visibility = role === 'tutor' ? 'public' : 'private';
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${courseId}/${user.id}/${fileName}`;

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('course-materials')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Insert Metadata into Database
            const { data, error: dbError } = await supabase
                .from('course_materials')
                .insert([
                    {
                        course_id: courseId,
                        uploader_id: user.id,
                        role: role,
                        file_path: filePath,
                        file_name: file.name,
                        file_size: file.size,
                        file_type: file.type,
                        visibility: visibility,
                        section_id: sectionId
                    }
                ])
                .select()
                .single();

            if (dbError) {
                // Cleanup storage if DB insert fails
                await supabase.storage.from('course-materials').remove([filePath]);
                throw dbError;
            }

            return data;
        } catch (error) {
            console.error("Error uploading material:", error);
            throw error;
        }
    },

    /**
     * Get materials for a course
     */
    async getMaterials(courseId) {
        const { data, error } = await supabase
            .from('course_materials')
            .select('*')
            .eq('course_id', courseId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Create a new section
     */
    async createSection(courseId, title) {
        const { data, error } = await supabase
            .from('course_sections')
            .insert([{ course_id: courseId, title }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Get sections for a course
     */
    async getSections(courseId) {
        const { data, error } = await supabase
            .from('course_sections')
            .select('*')
            .eq('course_id', courseId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    /**
     * Delete a section (Cascades to materials via DB constraint)
     * However, we MUST also delete the files from Storage.
     * Simple cascade delete in DB won't delete Storage files.
     * So we should fetch files in section, delete from storage, then delete section.
     */
    async deleteSection(sectionId) {
        try {
            // 1. Get files in this section
            const { data: files } = await supabase
                .from('course_materials')
                .select('file_path')
                .eq('section_id', sectionId);

            // 2. Delete from Storage
            if (files && files.length > 0) {
                const paths = files.map(f => f.file_path);
                await supabase.storage.from('course-materials').remove(paths);
            }

            // 3. Delete Section (DB cascade will remove course_materials rows)
            const { error } = await supabase
                .from('course_sections')
                .delete()
                .eq('id', sectionId);

            if (error) throw error;
        } catch (error) {
            console.error("Error deleting section:", error);
            throw error;
        }
    },

    /**
     * Delete a material
     */
    async deleteMaterial(id, filePath) {
        try {
            // 1. Delete from Storage
            const { error: storageError } = await supabase.storage
                .from('course-materials')
                .remove([filePath]);

            if (storageError) throw storageError;

            // 2. Delete from DB
            const { error: dbError } = await supabase
                .from('course_materials')
                .delete()
                .eq('id', id);

            if (dbError) throw dbError;

        } catch (error) {
            console.error("Error deleting material:", error);
            throw error;
        }
    },

    /**
     * Get a public or signed URL for downloading
     */
    getDownloadUrl(filePath) {
        return supabase.storage.from('course-materials').createSignedUrl(filePath, 3600);
    }
};

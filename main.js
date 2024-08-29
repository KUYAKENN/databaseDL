document.addEventListener('DOMContentLoaded', function () {
    const supabaseUrl = 'https://xqvflajilvgzbusdsihy.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxdmZsYWppbHZnemJ1c2RzaWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ3MzIyNzYsImV4cCI6MjA0MDMwODI3Nn0.r_YEN3k3W0SQl_gFmusj_bvQLnAsZ9ExXI4I-PnTXuA';
    const supabase_content = supabase.createClient(supabaseUrl, supabaseKey);

    const modal = document.getElementById('modal');
    const openModalBtn = document.getElementById('open-modal');
    const closeModalBtn = document.querySelector('.close-button');
    const addMemberForm = document.getElementById('add-member-form');
    const tableRows = document.getElementById('table-rows');
    const searchBar = document.querySelector('.search-bar');
    const categorySelect = document.getElementById('category-select');
    const pagination = document.querySelector('.pagination');
    const exportExcelBtn = document.getElementById('export-excel');
    const rowsPerPage = 10;
    let currentPage = 1;
    let currentMembers = [];
    let editingMemberId = null;

    // Fetch categories and populate the dropdown
    async function fetchCategories() {
        const { data: members, error } = await supabase_content
            .from('members')
            .select('category');

        if (error) {
            console.error('Error fetching categories:', error);
            return;
        }

        const categories = [...new Set(members.map(member => member.category))];
        populateCategorySelect(categories);
    }

    function populateCategorySelect(categories) {
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = `Category: ${category}`;
            categorySelect.appendChild(option);
        });
    }

    openModalBtn.addEventListener('click', () => {
        resetForm();
        modal.style.display = 'block';
    });

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Form submission with validation
    addMemberForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(addMemberForm);
        const memberData = {
            first_name: formData.get('first_name') || 'N/A',
            last_name: formData.get('last_name') || 'N/A',
            email: formData.get('email') || 'N/A',
            phone_number: formData.get('phone_number') || 'N/A',
            designation: formData.get('designation') || 'N/A',
            category: formData.get('category') || 'N/A',
            status: formData.get('status') === 'true'
        };

        // Validate the email field before saving
        if (!validateEmail(memberData.email)) {
            alert('Please enter a valid email address that includes an "@" symbol.');
            return;
        }

        try {
            if (editingMemberId) {
                await updateMember(editingMemberId, memberData);
            } else {
                await addMember(memberData);
            }

            modal.style.display = 'none';
            fetchAndDisplayMembers();
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    });

    // Email validation function
    function validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    async function addMember(memberData) {
        const { data, error } = await supabase_content
            .from('members')
            .insert([memberData]);

        if (error) {
            throw new Error(`Error adding new member: ${error.message}`);
        }
        console.log('New member added:', data);
    }

    async function updateMember(id, memberData) {
        const { data, error } = await supabase_content
            .from('members')
            .update(memberData)
            .eq('id', id);

        if (error) {
            throw new Error(`Error updating member: ${error.message}`);
        }
        console.log('Member updated:', data);
    }

    async function deleteMember(id) {
        const { error } = await supabase_content
            .from('members')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Error deleting member: ${error.message}`);
        }
        console.log('Member deleted');
    }

    async function fetchAndDisplayMembers() {
        const selectedCategory = categorySelect.value;
        const searchTerm = searchBar.value.toLowerCase();

        let query = supabase_content.from('members').select('*');

        if (selectedCategory !== 'all') {
            query = query.eq('category', selectedCategory);
        }

        try {
            const { data: members, error } = await query;

            if (error) {
                throw new Error(`Error fetching members: ${error.message}`);
            }

            // Filter based on search term
            currentMembers = members.filter(member => 
                member.first_name.toLowerCase().includes(searchTerm) ||
                member.last_name.toLowerCase().includes(searchTerm) ||
                member.designation.toLowerCase().includes(searchTerm)
            );

            displayMembers(currentMembers, currentPage);
            setupPagination(currentMembers);
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    }

    function displayMembers(members, page) {
        tableRows.innerHTML = '';
        const start = (page - 1) * rowsPerPage;
        const end = page * rowsPerPage;
        const paginatedMembers = members.slice(start, end);

        paginatedMembers.forEach(member => {
            const row = document.createElement('div');
            row.classList.add('table-row');
            row.innerHTML = `
                <div class="member-info">
                    <div class="name">${member.first_name} ${member.last_name}</div>
                </div>
                <span class="designation">${member.designation}</span>
                <span class="email">${member.email}</span>
                <span class="mobile">${member.phone_number}</span>
                <span class="status ${member.status ? 'active' : 'inactive'}">${member.status ? 'Active' : 'Inactive'}</span>
                <div class="actions">
                    <button class="edit" data-id="${member.id}"><i class="fas fa-pencil-alt"></i></button>
                    <button class="delete" data-id="${member.id}"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            tableRows.appendChild(row);
        });

        // Event listeners for edit and delete buttons
        document.querySelectorAll('.edit').forEach(button => {
            button.addEventListener('click', (event) => {
                const memberId = event.currentTarget.getAttribute('data-id');
                editMember(memberId);
            });
        });

        document.querySelectorAll('.delete').forEach(button => {
            button.addEventListener('click', async (event) => {
                const memberId = event.currentTarget.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this member?')) {
                    await deleteMember(memberId);
                    fetchAndDisplayMembers();
                }
            });
        });
    }

    function setupPagination(members) {
        pagination.innerHTML = '';
        const pageCount = Math.ceil(members.length / rowsPerPage);

        for (let i = 1; i <= pageCount; i++) {
            const pageButton = document.createElement('span');
            pageButton.textContent = i;
            pageButton.classList.add('page-number');
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            pageButton.addEventListener('click', () => {
                currentPage = i;
                displayMembers(members, currentPage);
                document.querySelector('.pagination .active').classList.remove('active');
                pageButton.classList.add('active');
            });
            pagination.appendChild(pageButton);
        }
    }

    async function editMember(id) {
        const { data: member, error } = await supabase_content
            .from('members')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching member:', error);
            alert('Could not fetch member data');
            return;
        }

        editingMemberId = id;
        fillFormWithMemberData(member);
        modal.style.display = 'block';
    }

    function fillFormWithMemberData(member) {
        addMemberForm.querySelector('#first_name').value = member.first_name || 'N/A';
        addMemberForm.querySelector('#last_name').value = member.last_name || 'N/A';
        addMemberForm.querySelector('#email').value = member.email || 'N/A';
        addMemberForm.querySelector('#phone_number').value = member.phone_number || 'N/A';
        addMemberForm.querySelector('#designation').value = member.designation || 'N/A';
        addMemberForm.querySelector('#category').value = member.category || 'N/A';
        addMemberForm.querySelector('#status').value = member.status ? 'true' : 'false';
    }

    function resetForm() {
        addMemberForm.reset();
        editingMemberId = null;
    }

    searchBar.addEventListener('input', () => {
        currentPage = 1;
        fetchAndDisplayMembers();
    });

    categorySelect.addEventListener('change', () => {
        currentPage = 1;
        fetchAndDisplayMembers();
    });

    exportExcelBtn.addEventListener('click', () => {
        exportToExcel(currentMembers);
    });

    // Updated function to handle Excel export for mobile compatibility
    function exportToExcel(members) {
        try {
            // Create a worksheet and workbook
            const worksheet = XLSX.utils.json_to_sheet(members);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');

            // Generate binary data
            const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

            // Create a blob from the workbook data
            const blob = new Blob([wbout], { type: 'application/octet-stream' });

            // Create a link element
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = 'Members.xlsx';

            // Append the link to the document and click it to trigger download
            document.body.appendChild(link);
            link.click();

            // Clean up
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            alert('Failed to export. Please try again on a supported device.');
        }
    }

    fetchCategories();
    fetchAndDisplayMembers();
});

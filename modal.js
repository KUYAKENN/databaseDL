// document.addEventListener('DOMContentLoaded', function () {
//     const modal = document.getElementById('modal');
//     const openModalBtn = document.getElementById('open-modal');
//     const closeModalBtn = document.querySelector('.close-button');
//     const addMemberForm = document.getElementById('add-member-form');

//     openModalBtn.addEventListener('click', () => {
//         modal.style.display = 'block';
//     });

//     closeModalBtn.addEventListener('click', () => {
//         modal.style.display = 'none';
//     });

//     window.addEventListener('click', (event) => {
//         if (event.target === modal) {
//             modal.style.display = 'none';
//         }
//     });

//     addMemberForm.addEventListener('submit', async (event) => {
//         event.preventDefault();

//         const supabaseUrl = 'https://hvqvmxakmursjidtfmdj.supabase.co';
//         const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2cXZteGFrbXVyc2ppZHRmbWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg2MDA4MjQsImV4cCI6MjAzNDE3NjgyNH0.dykJM61G-58LEnAyCUU6-irano2f4vraV8t1l8C5KZ8';
//         const supabase_content = supabase.createClient(supabaseUrl, supabaseKey);

//         const formData = new FormData(addMemberForm);
//         const imageFile = formData.get('image');

//         try {
//             // Ensure a file was selected
//             if (!imageFile) {
//                 alert("Please select an image file.");
//                 return;
//             }

//             console.log('Uploading image...');

//             // Upload the image to Supabase Storage using supabase_content
//             const { data: imageData, error: uploadError } = await supabase_content
//                 .storage
//                 .from('image')
//                 .upload(`public/${Date.now()}_${imageFile.name}`, imageFile);

//             if (uploadError) {
//                 console.error('Error uploading image:', JSON.stringify(uploadError, null, 2));
//                 alert('Error uploading image: ' + JSON.stringify(uploadError, null, 2));
//                 return;
//             }

//             console.log('Image uploaded:', imageData);

//             const newMember = {
//                 first_name: formData.get('first_name'),
//                 last_name: formData.get('last_name'),
//                 email: formData.get('email'),
//                 phone_number: formData.get('phone_number'),
//                 designation: formData.get('designation'),
//                 category: formData.get('category'),
//                 status: formData.get('status') === 'true',
//                 image: imageData.path, // Save the image path in the database
//             };

//             console.log('Adding new member:', newMember);

//             // Insert new member data into Supabase using supabase_content
//             const { data, error } = await supabase_content
//                 .from('members')
//                 .insert([newMember]);

//             if (error) {
//                 console.error('Error adding new member:', error);
//                 alert('Error adding new member: ' + error.message);
//                 return;
//             }

//             console.log('New member added:', data);
//             modal.style.display = 'none';
//             window.location.reload();
//         } catch (error) {
//             console.error('Error:', error);
//             alert('An error occurred. Please check the console for details.');
//         }
//     });
// });
    
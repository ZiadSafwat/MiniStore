 const urlParams = new URLSearchParams(window.location.search);
 const id = urlParams.get("id");

 function images() {
     const productImageInput = document.getElementById('productImage');
     const imagePreview = document.getElementById('imagePreview');

     productImageInput.addEventListener('change', function () {
         const files = Array.from(this.files);

         files.forEach(file => {
             const reader = new FileReader();

             reader.onload = function (e) {
                 const img = document.createElement('img');
                 img.src = e.target.result;
                 img.classList.add('img-thumbnail', 'me-2');
                 img.style.width = '100px';
                 img.style.height = '100px';

                 imagePreview.appendChild(img);
             };

             reader.readAsDataURL(file);
         });
     });
 }
 images();


 function getProduct(id) {
     fetch(`https://codesquad.pockethost.io/api/collections/product/records/${id}?expand=category%2C%20category.sub_categries%2C%20category.sub_categries.sub_categries`, {
             headers: {
                 'accept': 'application/json',
                 "Authorization": `Bearer ${localStorage.getItem('token')}`
             }
         })
         .then(res => {
             if (!res.ok) {
                 return res.json().then(err => {
                     throw err;
                 });
             }
             return res.json();
         })
         .then(data => {
             console.log('Product:', data);
             document.getElementById('title_en').value = data.title_en || '';
             document.getElementById('title_ar').value = data.title_ar || '';
             document.getElementById('description_en').value = data.description_en || '';
             document.getElementById('description_ar').value = data.description_ar || '';
             document.getElementById('productPrice').value = data.price || '';
             document.getElementById('productStock').value = data.stock || '';
             const selectedCategoryId = data.category[0];
             console.log(data.category[0]);

             loadCategories(selectedCategoryId);
             const imagePreview = document.getElementById('imagePreview');
             imagePreview.innerHTML = '';

             if (data.image && data.image.length > 0) {
                 data.image.forEach(img => {
                     const imageElement = document.createElement('img');
                     imageElement.src = `https://codesquad.pockethost.io/api/files/${data.collectionName}/${data.id}/${img}`;
                     imageElement.classList.add('img-thumbnail');
                     imageElement.style.width = '100px';
                     imageElement.style.height = '100px';
                     imagePreview.appendChild(imageElement);
                 });
             }

         })
         .catch(err => {
             console.error('Error:', err);
         });
 }

 getProduct(id)

 function updateProduct(id) {
     const form = document.getElementById('productForm');
     const formData = new FormData();
     formData.append('title_en', form.title_en.value);
     formData.append('title_ar', form.title_ar.value);
     formData.append('description_en', form.description_en.value);
     formData.append('description_ar', form.description_ar.value);
     formData.append('price', form.price.value);
     formData.append('stock', form.stock.value);
     formData.append('category', form.category.value);
     formData.append('category', form.category.value);
     const file = form.productImage.files[0];
     if (file) {
         formData.append('image', file);
     }
     console.log(form.category.value);

     fetch(`https://codesquad.pockethost.io/api/collections/product/records/${id}`, {
         method: 'PATCH',
         headers: {
             'accept': 'application/json',
             "Authorization": `Bearer ${localStorage.getItem('token')}`
         },
         body: formData
     });
 }
 document.getElementById('productForm').addEventListener('submit', function (e) {
     e.preventDefault();
     updateProduct(id);
 });

 function loadCategories() {
     fetch("https://codesquad.pockethost.io/api/new/home", {
             method: "GET",
             headers: {
                 "Authorization": `Bearer ${localStorage.getItem('token')}`,
                 'accept': 'application/json'
             }
         })
         .then(res => res.json())
         .then(data => {
             const finalData = data.data;
             const flattenedCategories = flattenCategories(finalData.categories);
             populateCategorySelect(flattenedCategories);
         });
 }

 function flattenCategories(data) {
     const result = [];

     function recurse(items) {
         for (const item of items) {
             result.push(item);
             if (item.children && item.children.length > 0) {
                 recurse(item.children);
             }
         }
     }
     recurse(data);
     return result;
 }

 function populateCategorySelect(categories, selectedId = null) {
     let cartoona = `<option disabled>Choose category</option>`;
     categories.forEach(category => {
         const isSelected = category.id === selectedId ? 'selected' : '';
         cartoona += `<option ${isSelected} value="${category.id}">${category.title.ar}</option>`;
     });
     document.getElementById("productCategory").innerHTML = cartoona;
 }

let deleteProd = document.getElementById("deleteProduct");

deleteProd.addEventListener('click', () => {
    deleteProduct(id);
});

async function deleteProduct(id) {
    if (!id) {
        console.error('No product ID provided');
        return;
    }

    try {
        const response = await fetch(`https://codesquad.pockethost.io/api/collections/product/records/${id}`, {
            method: 'DELETE',
            headers: {
                'accept': '*/*',
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete product');
        }
        
        window.location.href = "../home/home.html";
    } catch(e) {
        console.error('Error deleting product:', e);

    }
}
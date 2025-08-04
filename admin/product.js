document.getElementById('productForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData();
  formData.append('title_en', form.title_en.value);
  formData.append('title_ar', form.title_ar.value);
  formData.append('description_en', form.description_en.value);
  formData.append('description_ar', form.description_ar.value);
  formData.append('price', form.price.value);
  formData.append('stock', form.stock.value);
  formData.append('category', form.category.value);
  const file = form.productImage.files[0];
  if (file) {
    formData.append('image', file);
  }

  fetch('https://codesquad.pockethost.io/api/collections/product/records', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Accept': 'application/json'
    },
    body: formData
  })
    .then(res => {
      if (!res.ok) {
        return res.json().then(err => { throw err; });
      }
      return res.json();
    })
    .then(data => {
      console.log('Success:', data);
      alert('Product uploaded successfully!');
      form.reset();
    })
    .catch(err => {
      console.error('Error:', err);
      alert('Error: ' + (err.message || 'Something went wrong'));
    });
});


fetch("https://codesquad.pockethost.io/api/new/home", {
  method: "GET",
  headers: {
    "Authorization": `Bearer ${localStorage.getItem('token')}`,
    "Content-Type": "application/json",
  }
})
.then(res => res.json())
.then(data => {
  const finalData = data.data;
  const flattenedCategories = flattenCategories(finalData.categories);
  populateCategorySelect(flattenedCategories);
});

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

function populateCategorySelect(categories) {
  var cartoona = ``;
  categories.forEach(category => {
    cartoona += `<option selected value="${category.id}">${category.title.ar}</option>`;
  });
  document.getElementById("productCategory").innerHTML = cartoona;
}
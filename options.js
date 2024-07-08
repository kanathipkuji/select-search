let itemIdCounter = 1;

document.addEventListener('DOMContentLoaded', loadConfigurations);
document.getElementById('add-button').addEventListener('click', addItem);
document.getElementById('save-button').addEventListener('click', saveConfigurations);

function addItem() {
  addListItem(itemIdCounter++, '', '');
  updateAddButtonState();
}

function addListItem(id, label, url) {
  const tbody = document.getElementById('items-list');
  const tr = document.createElement('tr');

  const idTd = document.createElement('td');
  idTd.textContent = id;
  tr.appendChild(idTd);

  const labelTd = document.createElement('td');
  const labelInput = document.createElement('input');
  labelInput.type = 'text';
  labelInput.value = label;
  labelTd.appendChild(labelInput);
  tr.appendChild(labelTd);

  const urlTd = document.createElement('td');
  const urlInput = document.createElement('input');
  urlInput.type = 'text';
  urlInput.value = url;
  urlTd.appendChild(urlInput);
  tr.appendChild(urlTd);

  const actionTd = document.createElement('td');
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.className = 'delete-button'
  deleteButton.addEventListener('click', () => {
    tr.remove();
    updateItemIds();
    updateAddButtonState();
  });
  actionTd.appendChild(deleteButton);
  tr.appendChild(actionTd);

  tbody.appendChild(tr);
}

function isValidHttpUrl(str) {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', // fragment locator
    'i'
  );
  return pattern.test(str);
}

function saveConfigurations() {
  const items = [];
  let isValid = true;

  document.querySelectorAll('#items-list tr').forEach(tr => {
    const id = parseInt(tr.querySelector('td:first-child').textContent);
    const inputs = tr.querySelectorAll('input');
    const label = inputs[0].value.trim();
    const url = inputs[1].value.trim();

    if (!inputs || !isValidHttpUrl(url)) {
      isValid = false;
      return;
    }

    items.push({ id, label, url });
  });

  if (!isValid) {
    const validText = document.getElementById('validation-message');
    validText.textContent = 'Some inputs are not valid';
    validText.className = 'invalid';
    return;
  }

  chrome.storage.sync.set({ storedItems: items }, () => {
    console.log('Saved config:', items);
    const validText = document.getElementById('validation-message');
    validText.textContent = 'Configurations saved successfully.';
    validText.className = 'valid';
    setTimeout(() => {
      validText.textContent = '';
      validText.className = '';
    }, 3000);
    updateAddButtonState();
  });
}

async function loadConfigurations() {
  const data = await chrome.storage.sync.get('storedItems');
  const savedItems = data.storedItems || [];
  
  console.log('Loaded config:', savedItems);

  savedItems.forEach(({ id, label, url }) => {
    addListItem(id, label, url);
  });

  itemIdCounter = savedItems.length + 1;
}

function updateItemIds() {
  document.querySelectorAll('#items-list tr').forEach((tr, index) => {
    tr.querySelector('td:first-child').textContent = index + 1;
  });
  itemIdCounter = document.querySelectorAll('#items-list tr').length + 1;
}

function updateAddButtonState() {
  const lastRowInputs = document.querySelectorAll('#items-list tr:last-child input');
  const addButton = document.getElementById('add-button');

  addButton.disabled = !(lastRowInputs[0].value.trim() && lastRowInputs[1].value.trim());
}
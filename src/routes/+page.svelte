<script>
    import { onMount } from 'svelte';
    import { fly, slide } from 'svelte/transition';
	import { enhance } from '$app/forms';

    let items = [];
    let commands = [];
    let showForm = false;
    let newItem = { label: '', url: '' }; // Model for the new item
    let validationMessage = '';
    let deleting = []

    onMount(() => {
        chrome.storage.sync.get("items").then((store) => {
            items = store["items"] || [];
            console.log(items);
        });

        chrome.commands.getAll().then((savedCommands) => {
            commands = savedCommands;
            console.log(commands);
        });
    })

    function openForm() {
        showForm = true;
    }

    function closeForm() {
        showForm = false;
        newItem = { label: '', url: '' }; // Reset new item model
        validationMessage = ''; // Clear validation message
    }

    function saveItem() {
        if (!newItem.label || !newItem.url) {
            validationMessage = 'Both label and URL are required!';
            return;
        }

        items = [...items, { ...newItem, id: crypto.randomUUID() }];
        chrome.storage.sync.set({ items });
        console.log(items);
        closeForm();
    }

    function deleteItem(id) {
        deleting = [...deleting, id];
        items = items.filter(item => item.id !== id);
        chrome.storage.sync.set({ items });
        deleting = deleting.filter(deletedId => deletedId !== id);
    }


</script>
<div class="body">
    <h2>Shortcuts Configuration</h2>
    <table id="shortcuts-table">
        <thead>
            <tr>
                <th>#</th>
                <th>Label</th>
                <th>URL</th>
                <th>Shortcut Key</th>
                <th></th>
            </tr>
        </thead>
        <tbody id="items-list">
            <!-- List items will be added here dynamically -->
            {#each items.filter((item) => !deleting.includes(item.id)) as item, i (item.id)}
			<tr in:fly={{ y: 20 }} out:slide>
                <td>
                    {i + 1}
                </td>
                <td>
                    <span>{item.label}</span>
                </td>
                <td>
                    <span>{item.url}</span>
                </td>
                <td>
                    {#if i < commands.length}
                        <span>
                            {commands[i].shortcut}                            
                        </span>
                    {/if}
                </td>
                <td>
                    <button on:click={() => deleteItem(item.id)} class="delete-button"></button>
                </td>
				
			</tr>
		{/each}
        </tbody>
    </table>
    <div id="validation-message"></div> <!-- Placeholder for validation message -->
    <button on:click={openForm} id="add-button">Add Item</button>
    {#if showForm}
        <div class="popup-form">
            <form on:submit|preventDefault={saveItem}>
                <label for="label">Label:</label>
                <input type="text" id="label" bind:value={newItem.label} />

                <label for="url">URL:</label>
                <input type="url" id="url" bind:value={newItem.url} />

                <!-- Validation message -->
                {#if validationMessage}
                <div id="validation-message">{validationMessage}</div>
                {/if}

                <button type="submit">Save</button>
                <button type="button" on:click={closeForm}>Cancel</button>
            </form>
        </div>
    {/if}

</div>
<style>
    .body {
        font-family: Arial, sans-serif;
        padding: 20px;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
    }

    thead th {
        text-align: left;
        border-bottom: 2px solid #ddd;
        padding: 10px;
    }

    tbody td {
        padding: 10px;
        border-bottom: 1px solid #ddd;
    }

    input {
        width: 100%;
        padding: 5px;
    }

    button {
        margin: 5px;
        padding: 10px 20px;
        background-color: #4CAF50;
        color: white;
        border: none;
        cursor: pointer;
    }

    button#save-button {
        background-color: #008CBA;
    }

    button:hover {
        opacity: 1;
    }

    button.delete-button {
        border: none;
        background: url(./remove.svg) no-repeat 50% 50%;
        background-size: 1rem 1rem;
        cursor: pointer;
        height: 100%;
        aspect-ratio: 1;
        opacity: 0.5;
        transition: opacity 0.2s;
    }

    button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
        opacity: 0.6;
    }

    .popup-form {
        position: fixed;
        top: 30%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 20px;
        background-color: white;
        border: 1px solid #ccc;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        z-index: 1000;
    }

    #validation-message {
        font-weight: bold;
        margin-bottom: 10px;
    }

    #validation-message.invalid {
        color: red;
    }

    #validation-message.valid {
        color: #4CAF50;
    }
</style>
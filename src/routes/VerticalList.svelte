<script>
	import { flip } from 'svelte/animate';
    import { fly, fade } from 'svelte/transition';
	import { enhance } from '$app/forms';
    import {dragHandleZone, dragHandle} from "svelte-dnd-action";
    export let items;
    export let commands;
    export let deleting;
    const flipDurationMs = 200;
    const morphDisabled = true;

    let flyDistance = 0;
    let editingIndex = null;
    let editedItem = { label: '', url: '' };

	function handleDndConsider(e) {
		items = e.detail.items;
	}
	function handleDndFinalize(e) {
		items = e.detail.items;
        chrome.storage.sync.set({ items });
	}

    function transformDraggedElement(element, data, index) {
        const commandCell = element.querySelector('td:first-child');
        if (commandCell) {
            commandCell.innerHTML = null;
        }
    }

    function deleteItem(id) {
        deleting = [...deleting, id];
        items = items.filter(item => item.id !== id);
        chrome.storage.sync.set({ items });
        deleting = deleting.filter(deletedId => deletedId !== id);
        console.log('inner');
        console.log(items);
    }

    function editItem(id) {
        const itemToEdit = items.find(item => item.id === id);
        editedItem = { ...itemToEdit };
        editingIndex = id;
    }

    function saveEditedItem(id) {
        const index = items.findIndex(item => item.id === id);
        flyDistance = 200;
        if (index !== -1) {
            items[index] = { ...editedItem, id };
            chrome.storage.sync.set({ items });
            editingIndex = null;
        }
    }

    function cancelEdit() {
        editingIndex = null;
    }
</script>

<tbody
    use:dragHandleZone={{items, flipDurationMs, transformDraggedElement}} 
    on:consider={handleDndConsider} 
    on:finalize={handleDndFinalize}
>
	{#each items.filter((item) => !deleting.includes(item.id)) as item, i (item.id)}
    <tr animate:flip="{{duration: flipDurationMs}}">
        <td>
            {#if i < commands.length}
            <span>
                {commands[i].shortcut}<br>        
            </span>
            {:else}
            <span>N/A</span>
            {/if}
        </td>
        <td>
            {#if editingIndex === item.id}
            <input type="text" bind:value={editedItem.label} />
            {:else}
            <span>{item.label}</span>
            {/if}
        </td>
        <td class='url'>
            {#if editingIndex === item.id}
            <input type="text" bind:value={editedItem.url} />
            {:else}
            <span>{item.url}</span>
            {/if}
        </td>
        <td class='button'>
            {#if editingIndex === item.id}
            <button on:click={() => saveEditedItem(item.id)} class="save-button"></button>
            <button on:click={cancelEdit} class="cancel-button"></button>
            {:else}
            <button on:click={() => editItem(item.id)} class="edit-button"></button>
            <button on:click={() => deleteItem(item.id)} class="delete-button"></button>
            {/if}
            <div use:dragHandle class="drag-button"></div>
        </td>
    </tr>
	{/each}
</tbody>


<style>
	tbody {
		padding: 0.3em;
		overflow: scroll;
        width: 100%;
	}
	tr {
        min-height: 2.5rem;
        display: grid;
        grid-template-columns: 0.2fr 0.3fr 1fr auto;
		margin: 0.15em 0;
	}
    td {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0.2rem 0.75rem;
        border-bottom: 0.1rem solid #ddd;
        min-width: 2rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    td.url {
        justify-content: left;
    }
    td.button {
        margin-left: auto;
        display: flex;
        flex-wrap: nowrap;
        justify-content: space-between;
        column-gap: 0.6rem;
    }
    td.button>* {
        border: none;
        background-size: 1rem 1rem;
        cursor: pointer;
        height: 1rem;
        aspect-ratio: 1;
        opacity: 0.5;
        transition: opacity 0.2s;
    }
    button {
        background-color: black;
    }

    .delete-button {
        mask: url(./remove.svg) no-repeat 50% 50%;
    }
    .delete-button:hover {
        background-color: rgb(174, 50, 50); 
        opacity: 1;
    }

    .edit-button {
        mask: url(./edit.svg) no-repeat 50% 50%;
    }
    .edit-button:hover {
        background-color: rgb(24, 57, 114);
        opacity: 1;
    }

    .save-button {
        mask: url(./confirm.svg) no-repeat 50% 50%;
    }
    .save-button:hover {
        background-color: rgb(0, 186, 16);
        opacity: 1;
    }


    .cancel-button {
        mask: url(./cancel.svg) no-repeat 50% 50%;
        transition: background-color 0.3s, opacity 0.3s;
    }
    .cancel-button:hover {
        background-color: rgb(203, 42, 42);
        opacity: 1;
    }
    .drag-button {
        background: url(./dragIndicator.svg) no-repeat 50% 50%;
    }

    input {
        width: 100%;
        height: 1.5rem;
        font-size: inherit;
    }
</style>
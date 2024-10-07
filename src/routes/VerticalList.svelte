<script>
	import { flip } from 'svelte/animate';
    import { fly, slide } from 'svelte/transition';
	import { enhance } from '$app/forms';
    import {dragHandleZone, dragHandle} from "svelte-dnd-action";
    export let items;
    export let commands;
    export let deleting;
    const flipDurationMs = 300;
    const morphDisabled = true;

    let editingIndex = null;
    let editedItem = { label: '', url: '' };

	function handleDndConsider(e) {
		items = e.detail.items;
	}
	function handleDndFinalize(e) {
		items = e.detail.items;
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
    button.delete-button {
        background: url(./remove.svg) no-repeat 50% 50%;
    }
    button.edit-button {
        background: url(./edit.svg) no-repeat 50% 50%;
    }
    button.save-button {
        background: url(./confirm.svg) no-repeat 50% 50%;
    }
    button.cancel-button {
        background: url(./cancel.svg) no-repeat 50% 50%;
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
<tbody
    use:dragHandleZone={{items, flipDurationMs}} 
    on:consider={handleDndConsider} 
    on:finalize={handleDndFinalize}
>
	{#each items.filter((item) => !deleting.includes(item.id)) as item, i (item.id)}
    <tr animate:flip="{{duration: flipDurationMs}}">
        <td>
            {#if i < commands.length}
            <span>
                {commands[i].shortcut}                            
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
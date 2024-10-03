<script>
	import { flip } from 'svelte/animate';
    import { fly, slide } from 'svelte/transition';
	import { enhance } from '$app/forms';
    import {dragHandleZone, dragHandle} from "svelte-dnd-action";
    export let items;
    export let commands;
    const flipDurationMs = 300;
    const morphDisabled = true;
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
    }
</script>

<style>
	tbody {
		padding: 0.3em;
		overflow: scroll;
		height: 120px;
	}
	tr {
        display: grid;
        grid-template-columns: 0.2fr 0.3fr 1fr auto auto;
		margin: 0.15em 0;

	}
    td {
        height: 15px;
        text-align: center;
        padding: 10px;
        border-bottom: 1px solid #ddd;
    }
    td.url {
        text-align: left;
    }
    td.button {
        margin-left: auto;
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
        padding: 0;
        margin: 0;
    }
    .drag-button {
        /* text-align: left; */
        border: none;
        background: url(./dragIndicator.svg) no-repeat 50% 50%;
        background-size: 1rem 1rem;
        cursor: pointer;
        height: 100%;
        aspect-ratio: 1;
        opacity: 0.5;
        transition: opacity 0.2s;
        padding: 0;
        margin: 0;
    }

</style>
<tbody 
    use:dragHandleZone={{items, flipDurationMs}} 
    on:consider={handleDndConsider} 
    on:finalize={handleDndFinalize}
>
	{#each items as item, i (item.id)}
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
            <span>{item.label}</span>
        </td>
        <td class='url'>
            <span>{item.url}</span>
        </td>
        <td class='button'>
            <button on:click={() => deleteItem(item.id)} class="delete-button"></button>
        </td>
        <td class='button'>
            <div use:dragHandle class="drag-button"></div>
        </td>
    </tr>
	{/each}
</tbody>
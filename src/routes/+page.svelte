<script>
    import { onMount } from 'svelte';
    import VerticalList from './VerticalList.svelte';

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
        console.log('main')
        console.log(items);
        items = [...items, { ...newItem, id: crypto.randomUUID() }];
        chrome.storage.sync.set({ items });
        console.log(items);
        closeForm();
    }


</script>
<div class="body">
    <h1>Select Search</h1>
    <!-- <h2>Shortcuts Configuration</h2> -->
    <table id="shortcuts">
        <thead>
            <tr>
                <th>Shortcut Key</th>
                <th>Label</th>
                <th>URL</th>
                <th class='action'>
                    <div class="dummy"></div>
                    <div class="dummy"></div>
                    <div class="dummy"></div>
                </th>
            </tr>
        </thead>
        <VerticalList bind:items {commands} {deleting}/>
    </table>
    <div id="validation-message"></div>
    <button on:click={openForm} class="button-18 add-button">Add Item</button>
    {#if showForm}
        <div class="popup-form">
            <form on:submit|preventDefault={saveItem}>
                <div class="container">
                    <label for="label">Label:</label>
                    <input type="text" id="label" bind:value={newItem.label} />
    
                    <label for="url">URL:</label>
                    <input type="url" id="url" bind:value={newItem.url} />
    
                    {#if validationMessage}
                    <div id="validation-message">{validationMessage}</div>
                    {:else}
                    <div id="validation-message" style="visibility: hidden;">_</div>
                    {/if}
                </div>
                <button type="submit" class="button-18 save-button">Save</button>
                <button type="button" class="button-18 cancel-button" on:click={closeForm}>Cancel</button>
            </form>
        </div>
    {/if}

</div>
<style>

    h1 {
        position: relative;
        padding: 0;
        margin: 0;
        font-family: "Raleway", sans-serif;
        font-weight: 300;
        font-size: 40px;
        color: #080808;
        -webkit-transition: all 0.4s ease 0s;
        -o-transition: all 0.4s ease 0s;
        transition: all 0.4s ease 0s;
        text-align: center;
        padding-bottom: 0.7em; 
         
    }
    .body {
        font-family: Arial, sans-serif;
        padding: 20px;
    }

    table {
        width: 100%;
        border-collapse: collapse; 
        border-spacing: 0;
        table-layout: fixed;
    }

    thead {
        overflow: scroll;
        width: 100%;
    }

    tr {
        min-height: 2.5rem;
        display: grid;
        grid-template-columns: 0.2fr 0.3fr 1fr auto;
		margin: 0.15em 0;
	}

    th {
        display: flex;
        justify-content: center;
        align-items: center;
        border-bottom: 0.2rem solid #ddd;
        padding: 0.5rem 0.75rem;
    }


    th.action {
        margin-left: auto;
        display: flex;
        flex-wrap: nowrap;
        justify-content: space-between;
        column-gap: 0.6rem;
    }

    .dummy {
        border: none;
        background-size: 1rem 1rem;
        cursor: pointer;
        height: 1rem;
        aspect-ratio: 1;
        opacity: 0.5;
        transition: opacity 0.2s;
        visibility: hidden;
    }

    /* button {
        margin: 5px;
        padding: 10px 20px;
        background-color: #439db7;
        color: white;
        border: none;
        cursor: pointer;
    } */

    .popup-form {
        position: fixed;
        top: 30%;
        left: 50%;
        width: 20rem;
        transform: translate(-50%, -50%);
        padding: 20px;
        background-color: white;
        border: 1px solid #ccc;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        z-index: 1000;
    }

    .container {
        margin: 0;
        display: flex;
        flex-direction: column;
    }

    .container>* {
        margin-bottom: 0.7rem;
    }

    input {
        padding: 0.2rem;
    }
        
    .button-18 {
        align-items: center;
        background-color: #0667c7;
        border: 0;
        border-radius: 0.2rem;
        box-sizing: border-box;
        color: #ffffff;
        cursor: pointer;
        display: inline-flex;
        justify-content: center;
        line-height: 1.5rem;
        max-width: 30rem;
        min-height: 2.5rem;
        min-width: 0;
        overflow: hidden;
        padding: 0 1.2rem;
        text-align: center;
        touch-action: manipulation;
        transition: background-color 0.167s cubic-bezier(0.4, 0, 0.2, 1) 0s, box-shadow 0.167s cubic-bezier(0.4, 0, 0.2, 1) 0s, color 0.167s cubic-bezier(0.4, 0, 0.2, 1) 0s;
        user-select: none;
        -webkit-user-select: none;
        vertical-align: middle;
    }

    .save-button {
        background-color: #66c238;
    }
    .cancel-button {
        background-color: grey;
    }

    .button-18:hover,
    .button-18:focus {
        filter: brightness(95%);
        /* color: #ffffff; */
    }

    .button-18:active {
        /* filter: brightness(40%); */
        color: rgb(255, 255, 255, .7); 
    }
   

    .button-18:disabled { 
        cursor: not-allowed;
        background: rgba(0, 0, 0, .08);
        color: rgba(0, 0, 0, .3);
    }

    #validation-message {
        font-weight: bold;
        color: red;
        margin-bottom: 10px;
    }

    #validation-message.invalid {
        color: red;
    }

    #validation-message.valid {
        color: #4CAF50;
    }
</style>
App = {
    loading: false,
    contracts: {},
    async load() {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.render()
    },

    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    async loadWeb3() {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider
        } else {
            window.alert("Please connect to Metamask.")
        }
        if (window.ethereum) {
            await ethereum.request({ method: 'eth_requestAccounts' });
        } else if (window.web3) {} else {
            window.alert('No ethereum broswer detected! You can check out MetaMask!');
        }
    },

    async loadAccount() {
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        App.account = accounts[0];
    },

    async loadContract() {
        const todoList = await $.getJSON('TodoList.json')
        App.contracts.TodoList = TruffleContract(todoList)
        App.contracts.TodoList.setProvider(App.web3Provider)
        App.todoList = await App.contracts.TodoList.deployed()
        console.log(App.todoList)
    },

    async render() {
        if (App.loading) {
            return
        }

        App.setLoading(true)
        console.log(App.account)
        $('#account').html(App.account)

        await App.renderTasks()
        App.setLoading(false)
    },

    setLoading(isLoading) {
        App.loading = isLoading
        const loader = $('#loader')
        const content = $('#content')
        if (isLoading) {
            loader.show()
            content.hide()
        } else {
            loader.hide()
            content.show()
        }
    },

    async renderTasks() {
        // Load the total task count from the blockchain
        const taskCount = await App.todoList.taskCount();
        const $taskTemplete = $('.taskTemplate')
            // render out each task with template
        const completedTaskList = $('#completedTaskList')
        const taskList = $('#taskList')
        for (var i = 1; i <= taskCount; i++) {
            const task = await App.todoList.tasks(i)
            const taskId = task[0].toNumber()
            const taskContent = task[1]
            const taskCompleted = task[2]

            const $newTaskTemplate = $taskTemplete.clone()
            $newTaskTemplate.find('.content').html(taskContent)
            $newTaskTemplate.find('input')
                .prop('name', taskId)
                .prop('checked', taskCompleted)
                .on('click', App.toggleCompleted)
            $newTaskTemplate.css({ "display": "block" })

            if (taskCompleted) {
                completedTaskList.append($newTaskTemplate)
            } else {
                taskList.append($newTaskTemplate)
            }
        }
    }

}

$(() => {
    $(window).load(() => {
        App.load()
    })
})
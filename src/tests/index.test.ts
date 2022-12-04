import { ethers } from "ethers";
import { LoadBalanceRPC } from "../dynamic-balance";

(async () => {
    try {
    const abi = [{"stateMutability":"nonpayable","type":"fallback"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"addressToPoints","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"addressTotime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"depositEth","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"getRemainingTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenQuantity","type":"uint256"}],"name":"getTestTokens","outputs":[],"stateMutability":"nonpayable","type":"function"}]
    const rpcs = [
        "https://rpc.ankr.com/polygon_mumbai",
        "https://polygon-mumbai.g.alchemy.com/v2/Tv9MYE2mD4zn3ziBLd6S94HvLLjTocju",
        'https://polygon-mumbai.infura.io/v3/a618bb907c2f4670a721be9cd51f388e'
    ];
    const aggregate = new LoadBalanceRPC({
        maxConnections: 2,
        maxResponses: 2,
        maxRetries: 2,
        cache: {
            caching: false,
            cacheClear: 20000,
            excludeMethods: []
        }
    })
    const queue = await aggregate.init(rpcs)

    const provider = new ethers.providers.Web3Provider(aggregate)
    // console.log(provider)
    const provider1 = new ethers.providers.JsonRpcProvider('https://polygon-mumbai.g.alchemy.com/v2/Tv9MYE2mD4zn3ziBLd6S94HvLLjTocju')
    const provider2 = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/polygon_mumbai')
    const provider3 = new ethers.providers.JsonRpcProvider('https://polygon-mumbai.infura.io/v3/a618bb907c2f4670a721be9cd51f388e')
    const signer = (new ethers.Wallet('0deeb28bb0125df571c3817760ded64965ed18374ac8e9b3637ebc3c4401fa3d')).connect(provider)
    
    const contract = new ethers.Contract(
        "0x55cdcaa5Ef61771d13faf442C0df9d235A6D84E8",
        abi,
        provider
    );

    const contract1 = new ethers.Contract(
        "0x55cdcaa5Ef61771d13faf442C0df9d235A6D84E8",
        abi,
        provider1
    );
    const contract2 = new ethers.Contract(
        "0x55cdcaa5Ef61771d13faf442C0df9d235A6D84E8",
        abi,
        provider2
    );
    const contract3 = new ethers.Contract(
        "0x55cdcaa5Ef61771d13faf442C0df9d235A6D84E8",
        abi,
        provider3
    );
    // console.log(provider)
    const curr = new Date()
    const points = await contract.addressToPoints("0x444a900d6cc95f8d4568cb6e3096f518b9606294")
    await contract.addressToPoints("0x444a900d6cc95f8d4568cb6e3096f518b9606294")
    await contract.addressToPoints("0x444a900d6cc95f8d4568cb6e3096f518b9606294")
    await contract.addressToPoints("0x444a900d6cc95f8d4568cb6e3096f518b9606294")
    await contract.addressToPoints("0x444a900d6cc95f8d4568cb6e3096f518b9606294")
    await contract.addressToPoints("0x444a900d6cc95f8d4568cb6e3096f518b9606294")
    const finish = new Date()
    console.log(ethers.utils.formatEther(points.toString()), `first -> ${((finish.getTime() - curr.getTime()) / 1000) / 6}, ${(finish.getTime() - curr.getTime()) / 1000}`)
    // console.log(aggregate.queue)

    const curr1 = new Date()
    const points1 = await contract1.addressToPoints("0x444a900d6cc95f8d4568cb6e3096f518b9606294")
    await contract1.addressToPoints("0x444a900d6cc95f8d4568cb6e3096f518b9606294")
    await contract1.addressToPoints("0x444a900d6cc95f8d4568cb6e3096f518b9606294")
    await contract1.addressToPoints("0x444a900d6cc95f8d4568cb6e3096f518b9606294")
    await contract1.addressToPoints("0x444a900d6cc95f8d4568cb6e3096f518b9606294")
    await contract1.addressToPoints("0x444a900d6cc95f8d4568cb6e3096f518b9606294")
    const finish1 = new Date()
    console.log(ethers.utils.formatEther(points1.toString()), `second -> ${((finish1.getTime() - curr1.getTime()) / 1000) / 6}, ${(finish1.getTime() - curr1.getTime()) / 1000}`)


    const curr2 = new Date()
    const points2 = await contract2.addressToPoints("0x444a900d6cc95f8d4568cb6e3096f518b9606294")
    await contract2.addressToPoints("0x444a900d6cc95f8d4568cb6e3096f518b9606294")
    await contract2.addressToPoints("0x444a900d6cc95f8d4568cb6e3096f518b9606294")
    await contract2.addressToPoints("0x444a900d6cc95f8d4568cb6e3096f518b9606294")
    await contract2.addressToPoints("0x444a900d6cc95f8d4568cb6e3096f518b9606294")
    await contract2.addressToPoints("0x444a900d6cc95f8d4568cb6e3096f518b9606294")
    const finish2 = new Date()
    console.log(ethers.utils.formatEther(points2.toString()), `third -> ${((finish2.getTime() - curr2.getTime()) / 1000) / 6}, ${(finish2.getTime() - curr2.getTime()) / 1000}`)

    const curr3 = new Date()
    const points3 = await contract2.addressToPoints("0x444a900d6cc95f8d4568cb6e3096f518b9606294")
    await contract3.addressToPoints("0x444a900d6cc95f8d4568cb6e3096f518b9606294")
    await contract3.addressToPoints("0x444a900d6cc95f8d4568cb6e3096f518b9606294")
    await contract3.addressToPoints("0x444a900d6cc95f8d4568cb6e3096f518b9606294")
    await contract3.addressToPoints("0x444a900d6cc95f8d4568cb6e3096f518b9606294")
    await contract3.addressToPoints("0x444a900d6cc95f8d4568cb6e3096f518b9606294")
    const finish3 = new Date()
    console.log(ethers.utils.formatEther(points3.toString()), `forth -> ${((finish3.getTime() - curr3.getTime()) / 1000) / 6}, ${(finish3.getTime() - curr3.getTime()) / 1000}`)
    // const points = await contract.depositEth({
    //     value: ethers.utils.parseEther('0.001')
    // })
    // console.log(points)
        
    } catch (e) {
        console.error(e)
    }
})()
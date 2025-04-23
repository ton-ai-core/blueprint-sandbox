import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, Contract, OpenedContract, Sender, ContractProvider, Cell, StateInit, SendMode, TupleItem, TupleReader, Message, Transaction } from '@ton/core';
import { NetworkProvider, UIProvider }  from '@ton-ai-core/blueprint';
import { TonClient, TonClientParameters } from '@ton/ton';


class SandboxTonClient extends TonClient {
    constructor(private blockchain: Blockchain, private deployer: SandboxContract<TreasuryContract>) {
        super({ endpoint: 'sandbox' } as TonClientParameters);
    }

    override async getBalance(address: Address): Promise<bigint> {
        const acc = await this.blockchain.getContract(address);
        return acc.balance;
    }

    override async runMethod(address: Address, name: string, stack: TupleItem[] = []): Promise<{ gas_used: number, stack: TupleReader }> {
        const result = await this.blockchain.runGetMethod(address, name, stack);
        return { gas_used: Number(result.gasUsed), stack: new TupleReader(result.stack as TupleItem[]) };
    }

    override async callGetMethod(address: Address, name: string, stack: TupleItem[] = []): Promise<{ gas_used: number, stack: TupleReader }> {
        return this.runMethod(address, name, stack);
    }

    override async runMethodWithError(address: Address, name: string, params: any[] = []): Promise<{ gas_used: number, stack: TupleReader, exit_code: number }> {
        const result = await this.blockchain.runGetMethod(address, name, params);
        return { gas_used: Number(result.gasUsed), stack: new TupleReader(result.stack as TupleItem[]), exit_code: result.exitCode };
    }

    override async callGetMethodWithError(address: Address, name: string, stack: TupleItem[] = []): Promise<{ gas_used: number, stack: TupleReader }> {
        const result = await this.blockchain.runGetMethod(address, name, stack);
        return { gas_used: Number(result.gasUsed), stack: new TupleReader(result.stack as TupleItem[]) };
    }

    override async getTransactions(address: Address, opts: { limit: number, lt?: string, hash?: string, to_lt?: string, inclusive?: boolean }): Promise<Transaction[]> {
        return [];
    }

    override async getTransaction(address: Address, lt: string, hash: string): Promise<Transaction | null> {
        return null;
    }

    override async tryLocateResultTx(source: Address, destination: Address, created_lt: string): Promise<Transaction> {
        throw new Error('Not supported in sandbox');
    }

    override async tryLocateSourceTx(source: Address, destination: Address, created_lt: string): Promise<Transaction> {
        throw new Error('Not supported in sandbox');
    }

    override async getMasterchainInfo(): Promise<any> {
        return { workchain: 0, shard: '8000000000000000', initSeqno: 1, latestSeqno: 1 };
    }

    override async getWorkchainShards(seqno: number): Promise<any> {
        return [{ workchain: 0, shard: '8000000000000000', seqno: 1 }];
    }

    override async getShardTransactions(workchain: number, seqno: number, shard: string): Promise<any> {
        return [];
    }

    override async sendMessage(src: Message): Promise<void> {
        throw new Error('sendMessage is not supported in SandboxTonClient');
    }

    override async sendFile(src: Buffer): Promise<void> {
        throw new Error('sendFile is not supported in SandboxTonClient');
    }

    override async estimateExternalMessageFee(address: Address, args: { body: Cell, initCode: Cell | null, initData: Cell | null, ignoreSignature: boolean }): Promise<any> {
        return { fee: 0n };
    }

    override async sendExternalMessage(contract: Contract, src: Cell): Promise<void> {
        throw new Error('sendExternalMessage is not supported in SandboxTonClient');
    }

    override async isContractDeployed(address: Address): Promise<boolean> {
        const acc = await this.blockchain.getContract(address);
        return acc.accountState?.type === 'active';
    }

    override async getContractState(address: Address): Promise<{ balance: bigint; extra_currencies: { '@type': "extraCurrency"; id: number; amount: string; }[] | undefined; state: 'active' | 'uninitialized' | 'frozen'; code: Buffer | null; data: Buffer | null; lastTransaction: { lt: string; hash: string; } | null; blockId: { workchain: number; shard: string; seqno: number; }; timestampt: number; }> {
        const acc = await this.blockchain.getContract(address);
        const stateType = acc.accountState?.type ?? 'uninitialized';
        let resolvedState: 'active' | 'uninitialized' | 'frozen' = 'uninitialized';
        if (stateType === 'active') resolvedState = 'active';
        if (stateType === 'frozen') resolvedState = 'frozen';
        return {
            balance: acc.balance,
            extra_currencies: undefined,
            state: resolvedState,
            code: acc.accountState?.type === 'active' ? acc.accountState.state.code?.toBoc() ?? null : null,
            data: acc.accountState?.type === 'active' ? acc.accountState.state.data?.toBoc() ?? null : null,
            lastTransaction: null,
            blockId: { workchain: 0, shard: '8000000000000000', seqno: 1 },
            timestampt: this.blockchain.now ?? Math.floor(Date.now() / 1000),
        };
    }

    override open<T extends Contract>(src: T): OpenedContract<T> {
        return this.blockchain.openContract(src as unknown as SandboxContract<T>) as unknown as OpenedContract<T>;
    }

    override provider(address: Address, init?: StateInit | null): ContractProvider {
        return this.blockchain as unknown as ContractProvider;
    }
}

// Export the class
export class SandboxNetworkProvider implements NetworkProvider {
    private readonly internalUi: UIProvider;
    private readonly internalApi: SandboxTonClient;

    constructor(
        private blockchain: Blockchain,
        private deployer: SandboxContract<TreasuryContract>
    ) {
        this.internalUi = {
            write: (message: string): void => { console.log('[UI Write]', message); },
            prompt: async (message: string): Promise<boolean> => { 
                console.log('[UI Prompt - Answering Yes]', message); 
                return true; 
            },
            input: async (message: string): Promise<string> => { 
                console.log('[UI Input]', message); 
                console.log('mock send message ' + "'mock-input'")
                return 'mock-input'; 
            },
            inputAddress: async (message: string): Promise<Address> => { 
                console.log('[UI Input Address]', message); 
                const adress = 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c';
                console.log('mock send address ' + adress)
                return Address.parse(adress); 
            },
            choose: async <T>(message: string, choices: T[], display: (item: T) => string): Promise<T> => { 
                console.log('[UI Choose]', message, choices.map(display));
                return choices[0];
            },
            setActionPrompt: (message: string): void => { console.log('[UI Set Action]', message); },
            clearActionPrompt: (): void => { console.log('[UI Clear Action]'); },
        };
        this.internalApi = new SandboxTonClient(blockchain, deployer);
    }

    provider(address: Address, init?: { code?: Cell; data?: Cell }): ContractProvider {
        console.warn('SandboxNetworkProvider.provider() returning Blockchain instance, not a true ContractProvider wrapper.')
        return this.blockchain as unknown as ContractProvider; 
    }

    sender(): Sender {
        return this.deployer.getSender();
    }

    open<T extends Contract>(contract: T): OpenedContract<T> {
        const opened = this.blockchain.openContract(contract as unknown as SandboxContract<T>); 
        return opened as unknown as OpenedContract<T>; 
    }

    async waitForDeploy(addr: Address, attempts = 10, sleepDuration = 1000): Promise<void> {
        for (let i = 0; i < attempts; i++) {
            const contractState = await this.internalApi.getContractState(addr);
            if (contractState.state === 'active') {
                this.internalUi.write(`Contract ${addr.toString()} deployed and active.`);
                return;
            }
            await new Promise(resolve => setTimeout(resolve, sleepDuration));
        }
        throw new Error(`Contract ${addr.toString()} did not deploy within ${attempts} attempts.`);
    }

    api(): any {
        return this.internalApi;
    }

    async getContract<T extends Contract>(contract: T): Promise<OpenedContract<T> | null> {
        const state = await this.internalApi.getContractState(contract.address);
        if (state.state === 'active') {
            return this.open(contract); 
        }
        return null;
    }

    ui(): UIProvider {
       return this.internalUi;
    }

    network(): 'mainnet' | 'testnet' | 'custom' {
        return 'custom';
    }

    async isContractDeployed(address: Address): Promise<boolean> {
        const state = await this.internalApi.getContractState(address);
        return state.state === 'active';
    }

    async deploy(contract: Contract, value: bigint, body?: Cell, waitAttempts?: number): Promise<void> {
        console.log(`Mock Deploying ${contract.address.toString()} via internal message with value ${value.toString()}...`);
        
        const _init: StateInit | undefined = contract.init ? { code: contract.init.code, data: contract.init.data } : undefined; 

        await this.deployer.send({ 
            to: contract.address,
            value: value,
            bounce: false, 
            sendMode: SendMode.PAY_GAS_SEPARATELY, 
            init: contract.init, 
            body: body 
        });

        console.log(`Mock Deploy internal message sent for ${contract.address.toString()}.`);

        if (waitAttempts && waitAttempts > 0) {
            console.log(`Waiting up to ${waitAttempts} attempts for deployment...`);
            await this.waitForDeploy(contract.address, waitAttempts);
        }
    }
} 
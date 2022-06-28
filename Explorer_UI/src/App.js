import "./App.css";
import Home from "./components/Pages/Home/Home";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Blocks from "./components/Pages/Table/Blocks";
import Stack from "./components/Pages/Stacking/Stack";
import WalletCard from "./components/Pages/Wallet/WalletCard";
import NewTable from "./components/Pages/Table/NewTable";

import TransactionInfo from "./components/Pages/Table/TransactionInfo";
import DelegatorTable from "./components/Pages/Delegator/DelegatorTable";
import ValidatorInfo from "./components/Pages/Delegator/ValidatorInfo";
import SearchBlock from "./components/Pages/SearchData/SearchBlock.js";
import SearchHash from "./components/Pages/SearchData/SearchHash.js";
import AllBlock from "./components/Pages/Blocks/AllBlock.js";
import BlockNumberDetails from "./components/Pages/Blocks/BlockNumberDetails.js";
import AllTransactions from "./components/Pages/AllTransactions/AllTransactions.js";
import TransactionTable from "./components/Pages/Stacking/TransactionTable.js";
import ValidatorsSetInfo from "./components/Pages/Stacking/ValidatorsSetInfo";
import Graph from "./components/Graph/Graph.js";
import UnStaking from "./components/Pages/Stacking/UnStakingHome.js";
import Transactions from "./components/Pages/Table/Transactions";
import TransactionDetails from "./components/Pages/Table/TransactionDetails";
import ListDelegator from "./components/Pages/Delegator/ListDelegator";
import Voting from "./components/Pages/Voting/Voting";
import DepositeTable from "./components/Pages/Deposite/DepositeTable";
import CreateProposall from "./components/Pages/Voting/CreateProposall";
import MyProposal from "./components/Pages/Voting/MyProposal";
import ValidatorUnstake from "./components/Pages/Stacking/ValidatorUnstake";
import Faucet from "./components/Pages/Faucet/Faucet";
import SearchBalance from "./components/Pages/SearchData/SearchBalance";
import Swap from "./components/Pages/Swap/Swap";
import TokenDeploy from "./components/Pages/TokenDeploy/TokenDeploy";
import RegisterContract from "./components/Pages/Contract/RegisterContract";
import ContractClaimReward from './components/Pages/Contract/ContractClaimReward';
function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/blocks"
            element={
              <>
                <Blocks />
              </>
            }
          />

          <Route
            path="/transactions"
            element={
              <>
                <Transactions />
              </>
            }
          />

          <Route
            path="/staking"
            element={
              <>
                <Stack />
              </>
            }
          />

          <Route
            path="/unstaking"
            element={
              <>
                <UnStaking />
              </>
            }
          />

          <Route
            path="/transactionDetails"
            element={
              <>
                <TransactionInfo />
              </>
            }
          />

          <Route
            path="/wallet"
            element={
              <>
                <WalletCard />
              </>
            }
          />

          <Route
            path="/singledetails"
            element={
              <>
                <NewTable />
              </>
            }
          />

          <Route
            path="/singletransactioninfo"
            element={
              <>
                <TransactionDetails />
              </>
            }
          />

          <Route
            path="/block/:blocknumber"
            element={
              <>
                <SearchBlock />
              </>
            }
          />

          <Route
            path="/hashinfo"
            element={
              <>
                <SearchHash />
              </>
            }
          />

          <Route
            path="/deploy"
            element={
              <>
                <TokenDeploy />
              </>
            }
          />

          <Route
            path="/allblocks"
            element={
              <>
                <AllBlock />
              </>
            }
          />

          <Route
            path="/swap"
            element={
              <>
                <Swap />
              </>
            }
          />

          <Route
            path="/alltransactions"
            element={
              <>
                <AllTransactions />
              </>
            }
          />

          <Route
            path="/blockdetails"
            element={
              <>
                <BlockNumberDetails />
              </>
            }
          />

          <Route
            path="/validator_leaderboard"
            element={
              <>
                <TransactionTable />
              </>
            }
          />

          <Route
            path="/validator_info"
            element={
              <>
                <ValidatorsSetInfo />
              </>
            }
          />

          <Route
            path="/address/:address"
            element={
              <>
                <SearchBalance />
              </>
            }
          />

          <Route
            path="/faucet"
            element={
              <>
                <Faucet />
              </>
            }
          />

          <Route
            path="/graph"
            element={
              <>
                <Graph />
              </>
            }
          />

          <Route
            path="/validator_details"
            element={
              <>
                <ValidatorInfo />
              </>
            }
          />

          <Route
            path="/delegator_list"
            element={
              <>
                <DelegatorTable />
              </>
            }
          />

          <Route
            path="/voting"
            element={
              <>
                <Voting />
              </>
            }
          />
          <Route
            path="/delegator_count"
            element={
              <>
                <ListDelegator />
              </>
            }
          />

          <Route
            path="/deposit"
            element={
              <>
                <DepositeTable />
              </>
            }
          />
          <Route
            path="/create-proposal"
            element={
              <>
                <CreateProposall />
              </>
            }
          />

          <Route
            path="/unstaking2"
            element={
              <>
                <ValidatorUnstake />
              </>
            }
          />

          <Route
            path="/my-proposal"
            element={
              <>
                <MyProposal />
              </>
            }
          />
          <Route
            path="/register-contract"
            element={
              <>
                <RegisterContract />
              </>
            }
          />
                 <Route
            path="/claim-contract-reward"
            element={
              <>
                <ContractClaimReward/>
              </>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

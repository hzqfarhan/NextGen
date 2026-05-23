"use client"

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Database, Sparkles, CheckCircle2, XCircle, RefreshCw, ArrowLeft, Terminal, AlertCircle, MessageSquare, UserCheck, Activity, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface DiagnosticResult {
    success: boolean;
    loading: boolean;
    error?: string;
    latency?: string;
    host?: string;
    tables?: string[];
    chatLogsExist?: boolean;
    userSyncExist?: boolean;
    usersExist?: boolean;
    savingsExist?: boolean;
    transfersExist?: boolean;
    billsExist?: boolean;
    response?: string;
}

interface ChatLog {
    id: number;
    timestamp: string;
    user_name: string;
    agent_id: string;
    message: string;
    response: string;
    function_called: string | null;
}

interface UserSync {
    user_name: string;
    balance: string;
    resilience_score: number;
    streak: number;
    updated_at: string;
}

interface UsageInfo {
    model: string;
    rpdUsed: number;
    rpdLimit: number;
    rpmUsed: number;
    rpmLimit: number;
}

export default function DiagnosticsPage() {
    const [dbResult, setDbResult] = useState<DiagnosticResult>({ success: false, loading: false });
    const [geminiResult, setGeminiResult] = useState<DiagnosticResult>({ success: false, loading: false });
    const [envCheck, setEnvCheck] = useState({
        checked: false,
        dbUrlSet: false,
        geminiKeySet: false,
        dbUrlMasked: '',
        geminiKeyMasked: ''
    });

    // Database Tables Data State
    const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
    const [userSyncs, setUserSyncs] = useState<UserSync[]>([]);
    const [savingsList, setSavingsList] = useState<any[]>([]);
    const [transfersList, setTransfersList] = useState<any[]>([]);
    const [billsList, setBillsList] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'sync' | 'savings' | 'transfers' | 'bills' | 'erd'>('chat');

    // Quota usage metrics
    const [usage, setUsage] = useState<UsageInfo>({
        model: 'gemini-2.5-flash',
        rpdUsed: 0,
        rpdLimit: 20,
        rpmUsed: 0,
        rpmLimit: 15
    });

    useEffect(() => {
        // Query environment check on mount
        fetch('/api/diagnostics/db')
            .then(res => res.json())
            .then(data => {
                const dbUrlSet = data.error !== 'DATABASE_URL is not set in environment variables.';
                setEnvCheck(prev => ({
                    ...prev,
                    checked: true,
                    dbUrlSet,
                    dbUrlMasked: dbUrlSet ? 'postgres://nextgenuser:****@' + (data.host || '103.40.207.195') + ':5432/nextgendb' : 'NOT SET'
                }));
            });

        fetch('/api/diagnostics/gemini')
            .then(res => res.json())
            .then(data => {
                const geminiKeySet = data.error !== 'GEMINI_API_KEY is not set in environment variables.';
                setEnvCheck(prev => ({
                    ...prev,
                    geminiKeySet,
                    geminiKeyMasked: geminiKeySet ? 'AIzaSyAdfho6MZZi...pjmo' : 'NOT SET'
                }));
            });

        fetchTableData();
    }, []);

    const fetchTableData = async () => {
        setLoadingData(true);
        try {
            const res = await fetch('/api/diagnostics/data');
            const data = await res.json();
            if (data.success) {
                setChatLogs(data.chatLogs || []);
                setUserSyncs(data.userSyncs || []);
                setSavingsList(data.savings || []);
                setTransfersList(data.transfers || []);
                setBillsList(data.bills || []);
                if (data.usage) {
                    setUsage(data.usage);
                }
            }
        } catch (e) {
            console.error('Failed to load table data:', e);
        } finally {
            setLoadingData(false);
        }
    };

    const runTests = async () => {
        // Test Database
        setDbResult(prev => ({ ...prev, loading: true, error: undefined }));
        try {
            const dbRes = await fetch('/api/diagnostics/db');
            const dbData = await dbRes.json();
            setDbResult({
                success: dbData.success,
                loading: false,
                error: dbData.error,
                latency: dbData.latency,
                host: dbData.host,
                tables: dbData.tables,
                chatLogsExist: dbData.chatLogsExist,
                userSyncExist: dbData.userSyncExist,
                usersExist: dbData.usersExist,
                savingsExist: dbData.savingsExist,
                transfersExist: dbData.transfersExist,
                billsExist: dbData.billsExist
            });
        } catch (err: any) {
            setDbResult({
                success: false,
                loading: false,
                error: err.message || 'Network request failed'
            });
        }

        // Test Gemini
        setGeminiResult(prev => ({ ...prev, loading: true, error: undefined }));
        try {
            const geminiRes = await fetch('/api/diagnostics/gemini');
            const geminiData = await geminiRes.json();
            setGeminiResult({
                success: geminiData.success,
                loading: false,
                error: geminiData.error,
                latency: geminiData.latency,
                response: geminiData.response
            });
        } catch (err: any) {
            setGeminiResult({
                success: false,
                loading: false,
                error: err.message || 'Network request failed'
            });
        }

        // Refresh database tables logs
        fetchTableData();
    };

    // Helper to calculate usage percentage
    const rpdPercent = Math.min((usage.rpdUsed / usage.rpdLimit) * 100, 100);
    const rpmPercent = Math.min((usage.rpmUsed / usage.rpmLimit) * 100, 100);

    return (
        <div className="min-h-screen md:h-screen bg-gradient-to-tr from-[#FAFAFA] via-[#FCF0F1] to-[#E9F2FE] text-[#221F20] font-sans p-4 md:p-6 relative md:overflow-hidden flex flex-col items-center justify-center py-6 md:py-0">
            {/* Background decorative glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#FFE9F2] blur-[150px] rounded-full pointer-events-none opacity-80" />
            <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-[#E9F2FE] blur-[130px] rounded-full pointer-events-none opacity-80" />

            <div className="w-full max-w-5xl h-auto md:h-full md:max-h-[90vh] z-10 flex flex-col space-y-4 bg-white/40 backdrop-blur-lg border border-[#F5CFDE]/60 p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_12px_50px_rgba(223,0,89,0.04)] min-h-0">
                
                {/* Header Panel */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 border border-[#F5CFDE] p-4 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <Link href="/settings" className="p-2.5 rounded-2xl bg-white border border-[#E5E7EB] text-[#555555] hover:text-[#DF0059] hover:border-[#DF0059]/40 hover:scale-105 active:scale-95 transition-all shadow-sm">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full bg-[#FFE9F2] text-[#DF0059] font-black text-[8px] uppercase tracking-wider">
                                    System Monitor
                                </span>
                            </div>
                            <h1 className="text-xl font-black tracking-tight text-[#221F20] mt-0.5 flex items-center gap-1.5">
                                NextGen <span className="bg-gradient-to-r from-[#DF0059] to-[#E06E9C] bg-clip-text text-transparent">Diagnostics</span>
                            </h1>
                        </div>
                    </div>

                    <button 
                        onClick={runTests} 
                        disabled={dbResult.loading || geminiResult.loading}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#DF0059] to-[#CC0D5A] text-white font-black text-xs shadow-lg shadow-[#DF0059]/20 hover:shadow-[#DF0059]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3 h-3 ${dbResult.loading || geminiResult.loading ? 'animate-spin' : ''}`} />
                        Run Diagnostics
                    </button>
                </div>

                {/* Bento Grid (Desktop fit-to-screen) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 min-h-0 overflow-y-visible md:overflow-y-auto md:overflow-x-hidden">
                    
                    {/* Environment Variables Panel (Bento 2 - 3 Columns) */}
                    <div className="col-span-1 md:col-span-3 bg-white/90 border border-[#FAE7EF] p-4 rounded-3xl shadow-sm flex flex-col justify-between space-y-3 min-h-[140px]">
                        <div>
                            <div className="flex items-center gap-1.5 mb-1">
                                <Terminal className="w-4 h-4 text-[#DF0059]" />
                                <h2 className="text-xs font-black text-[#221F20] tracking-tight">Env Variables</h2>
                            </div>
                            <p className="text-[10px] font-medium text-[#727272]">System variables state.</p>
                        </div>

                        <div className="space-y-2">
                            <div className="p-2 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] flex items-center justify-between text-[9px]">
                                <div className="min-w-0 flex-1 pr-1.5">
                                    <p className="font-extrabold text-[#221F20]">DATABASE_URL</p>
                                    <p className="font-mono text-[#727272] text-[8px] truncate select-all mt-0.5">{envCheck.dbUrlMasked || 'Checking...'}</p>
                                </div>
                                {envCheck.checked && (
                                    envCheck.dbUrlSet ? 
                                        <span className="px-2 py-0.5 rounded-full bg-[#E8F6EF] text-[#49B9B3] border border-[#49B9B3]/25 font-black text-[8px] tracking-tighter uppercase">Active</span> :
                                        <span className="px-2 py-0.5 rounded-full bg-[#FAE7EF] text-[#DF0059] border border-[#DF0059]/25 font-black text-[8px] tracking-tighter uppercase">Missing</span>
                                )}
                            </div>

                            <div className="p-2 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] flex items-center justify-between text-[9px]">
                                <div className="min-w-0 flex-1 pr-1.5">
                                    <p className="font-extrabold text-[#221F20]">GEMINI_API_KEY</p>
                                    <p className="font-mono text-[#727272] text-[8px] truncate select-all mt-0.5">{envCheck.geminiKeyMasked || 'Checking...'}</p>
                                </div>
                                {envCheck.checked && (
                                    envCheck.geminiKeySet ? 
                                        <span className="px-2 py-0.5 rounded-full bg-[#E8F6EF] text-[#49B9B3] border border-[#49B9B3]/25 font-black text-[8px] tracking-tighter uppercase">Active</span> :
                                        <span className="px-2 py-0.5 rounded-full bg-[#FAE7EF] text-[#DF0059] border border-[#DF0059]/25 font-black text-[8px] tracking-tighter uppercase">Missing</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quota Monitor Panel (Bento 3 - 3 Columns) */}
                    <div className="col-span-1 md:col-span-3 bg-white/90 border border-[#FAE7EF] p-4 rounded-3xl shadow-sm flex flex-col justify-between space-y-3 min-h-[140px]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <Activity className="w-4 h-4 text-[#DF0059]" />
                                <h2 className="text-xs font-black text-[#221F20] tracking-tight">API Quota</h2>
                            </div>
                            <span className="px-1.5 py-0.5 rounded-md bg-[#E9F2FE] text-[#237AF9] text-[8px] font-black font-mono border border-[#237AF9]/15">
                                {usage.model.replace('gemini-', '')}
                            </span>
                        </div>

                        <div className="space-y-2">
                            {/* RPD Progress */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-[8px] font-black uppercase">
                                    <span className="text-[#555555]">RPD Rate</span>
                                    <span className={usage.rpdUsed >= usage.rpdLimit ? 'text-[#DF0059]' : 'text-[#49B9B3]'}>
                                        {usage.rpdUsed}/{usage.rpdLimit}
                                    </span>
                                </div>
                                <div className="w-full bg-[#F3F4F6] rounded-full h-1.5 overflow-hidden p-0.5 border border-[#E5E7EB]">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            rpdPercent > 90 ? 'bg-gradient-to-r from-red-500 to-[#DF0059]' :
                                            rpdPercent > 60 ? 'bg-gradient-to-r from-[#FFC107] to-amber-500' :
                                            'bg-[#49B9B3]'
                                        }`} 
                                        style={{ width: `${rpdPercent}%` }}
                                    />
                                </div>
                            </div>

                            {/* RPM Progress */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-[8px] font-black uppercase">
                                    <span className="text-[#555555]">RPM Rate</span>
                                    <span className={usage.rpmUsed >= usage.rpmLimit ? 'text-[#DF0059] animate-pulse' : 'text-[#49B9B3]'}>
                                        {usage.rpmUsed}/{usage.rpmLimit}
                                    </span>
                                </div>
                                <div className="w-full bg-[#F3F4F6] rounded-full h-1.5 overflow-hidden p-0.5 border border-[#E5E7EB]">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            rpmPercent > 80 ? 'bg-[#DF0059]' : 'bg-[#49B9B3]'
                                        }`} 
                                        style={{ width: `${rpmPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PostgreSQL Diagnostic Panel (Bento 4 - 3 Columns) */}
                    <div className={`col-span-1 md:col-span-3 p-4 rounded-3xl border flex flex-col justify-between space-y-3 min-h-[140px] shadow-sm transition-all duration-300 ${
                        dbResult.loading ? 'border-[#FAE7EF] bg-white/50' :
                        !envCheck.dbUrlSet ? 'border-[#FAE7EF] bg-white/60' :
                        dbResult.error ? 'border-[#DF0059]/30 bg-[#FAE7EF]/20' :
                        dbResult.latency ? 'border-[#49B9B3]/35 bg-[#ECF7F7]/30' :
                        'border-[#FAE7EF] bg-white/90'
                    }`}>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-xl ${dbResult.error ? 'bg-[#FAE7EF] text-[#DF0059]' : 'bg-[#E9F2FE] text-[#237AF9]'}`}>
                                    <Database className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-[#221F20] tracking-tight">Postgres DB</h3>
                                    <p className="text-[9px] text-[#727272] font-semibold">{dbResult.latency || 'Unchecked'}</p>
                                </div>
                            </div>
                            
                            <div>
                                {dbResult.loading && <RefreshCw className="w-4 h-4 text-[#727272] animate-spin" />}
                                {!dbResult.loading && dbResult.latency && <CheckCircle2 className="w-4 h-4 text-[#49B9B3]" />}
                                {!dbResult.loading && dbResult.error && <XCircle className="w-4 h-4 text-[#DF0059]" />}
                            </div>
                        </div>

                        {dbResult.success && (
                            <div className="grid grid-cols-5 gap-1 pt-1.5 border-t border-[#FAE7EF] text-[8px] font-black text-center">
                                <span className={`p-1 rounded ${dbResult.chatLogsExist ? 'bg-[#E8F6EF] text-[#49B9B3]' : 'bg-slate-100 text-[#727272]'}`} title="chat_logs">chat</span>
                                <span className={`p-1 rounded ${dbResult.usersExist ? 'bg-[#E8F6EF] text-[#49B9B3]' : 'bg-slate-100 text-[#727272]'}`} title="users">user</span>
                                <span className={`p-1 rounded ${dbResult.savingsExist ? 'bg-[#E8F6EF] text-[#49B9B3]' : 'bg-slate-100 text-[#727272]'}`} title="savings">save</span>
                                <span className={`p-1 rounded ${dbResult.transfersExist ? 'bg-[#E8F6EF] text-[#49B9B3]' : 'bg-slate-100 text-[#727272]'}`} title="transfers">tx</span>
                                <span className={`p-1 rounded ${dbResult.billsExist ? 'bg-[#E8F6EF] text-[#49B9B3]' : 'bg-slate-100 text-[#727272]'}`} title="bills">bills</span>
                            </div>
                        )}

                        {dbResult.error && (
                            <p className="text-[8px] font-mono text-[#CC0D5A] truncate bg-white/80 p-1.5 rounded border border-[#FAE7EF]">
                                {dbResult.error}
                            </p>
                        )}
                    </div>

                    {/* Gemini Diagnostic Panel (Bento 5 - 3 Columns) */}
                    <div className={`col-span-1 md:col-span-3 p-4 rounded-3xl border flex flex-col justify-between space-y-3 min-h-[140px] shadow-sm transition-all duration-300 ${
                        geminiResult.loading ? 'border-[#FAE7EF] bg-white/50' :
                        !envCheck.geminiKeySet ? 'border-[#FAE7EF] bg-white/60' :
                        geminiResult.error ? 'border-[#DF0059]/30 bg-[#FAE7EF]/20' :
                        geminiResult.latency ? 'border-[#49B9B3]/35 bg-[#ECF7F7]/30' :
                        'border-[#FAE7EF] bg-white/90'
                    }`}>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-xl ${geminiResult.error ? 'bg-[#FAE7EF] text-[#DF0059]' : 'bg-[#FFF4D5] text-[#CBA024]'}`}>
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-[#221F20] tracking-tight">Gemini AI</h3>
                                    <p className="text-[9px] text-[#727272] font-semibold">{geminiResult.latency || 'Unchecked'}</p>
                                </div>
                            </div>
                            
                            <div>
                                {geminiResult.loading && <RefreshCw className="w-4 h-4 text-[#727272] animate-spin" />}
                                {!geminiResult.loading && geminiResult.latency && <CheckCircle2 className="w-4 h-4 text-[#49B9B3]" />}
                                {!geminiResult.loading && geminiResult.error && <XCircle className="w-4 h-4 text-[#DF0059]" />}
                            </div>
                        </div>

                        {geminiResult.latency && (
                            <div className="p-1.5 rounded-lg bg-[#E9F2FE]/50 border border-[#237AF9]/10 text-[8px] italic font-bold text-[#221F20] line-clamp-2">
                                "{geminiResult.response}"
                            </div>
                        )}

                        {geminiResult.error && (
                            <p className="text-[8px] font-mono text-[#CC0D5A] truncate bg-white/80 p-1.5 rounded border border-[#FAE7EF]">
                                {geminiResult.error}
                            </p>
                        )}
                    </div>

                    {/* Table & ERD Viewer Panel (Bento 6 - Full Width & Flex Stretched) */}
                    <div className="col-span-1 md:col-span-12 bg-white/95 border border-[#FAE7EF] p-4 rounded-[2rem] shadow-sm flex flex-col flex-1 min-h-0 space-y-4">
                        
                        {/* Tab Headers */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FAE7EF] pb-3 shrink-0">
                            
                            {/* Navigation Tabs */}
                            <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] w-fit">
                                <button
                                    onClick={() => setActiveTab('chat')}
                                    className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5 ${
                                        activeTab === 'chat' 
                                            ? 'bg-gradient-to-r from-[#DF0059] to-[#CC0D5A] text-white shadow-sm' 
                                            : 'text-[#555555] hover:text-[#DF0059] hover:bg-[#FAE7EF]/30'
                                    }`}
                                >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    chat_logs ({chatLogs.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('sync')}
                                    className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5 ${
                                        activeTab === 'sync' 
                                            ? 'bg-gradient-to-r from-[#DF0059] to-[#CC0D5A] text-white shadow-sm' 
                                            : 'text-[#555555] hover:text-[#DF0059] hover:bg-[#FAE7EF]/30'
                                    }`}
                                >
                                    <UserCheck className="w-3.5 h-3.5" />
                                    users ({userSyncs.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('savings')}
                                    className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5 ${
                                        activeTab === 'savings' 
                                            ? 'bg-gradient-to-r from-[#DF0059] to-[#CC0D5A] text-white shadow-sm' 
                                            : 'text-[#555555] hover:text-[#DF0059] hover:bg-[#FAE7EF]/30'
                                    }`}
                                >
                                    <BarChart3 className="w-3.5 h-3.5" />
                                    savings ({savingsList.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('transfers')}
                                    className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5 ${
                                        activeTab === 'transfers' 
                                            ? 'bg-gradient-to-r from-[#DF0059] to-[#CC0D5A] text-white shadow-sm' 
                                            : 'text-[#555555] hover:text-[#DF0059] hover:bg-[#FAE7EF]/30'
                                    }`}
                                >
                                    <Activity className="w-3.5 h-3.5" />
                                    transfers ({transfersList.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('bills')}
                                    className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5 ${
                                        activeTab === 'bills' 
                                            ? 'bg-gradient-to-r from-[#DF0059] to-[#CC0D5A] text-white shadow-sm' 
                                            : 'text-[#555555] hover:text-[#DF0059] hover:bg-[#FAE7EF]/30'
                                    }`}
                                >
                                    <Database className="w-3.5 h-3.5" />
                                    bills ({billsList.length})
                                </button>

                                {/* ERD Diagram Tab */}
                                <button
                                    onClick={() => setActiveTab('erd')}
                                    className={`px-3.5 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5 ${
                                        activeTab === 'erd' 
                                            ? 'bg-gradient-to-r from-[#DF0059] to-[#CC0D5A] text-white shadow-sm' 
                                            : 'text-[#555555] hover:text-[#DF0059] hover:bg-[#FAE7EF]/30'
                                    }`}
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    ERD Schema Map 🗺️
                                </button>
                            </div>

                            {activeTab !== 'erd' && (
                                <button 
                                    onClick={fetchTableData}
                                    disabled={loadingData}
                                    className="px-3 py-2 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] hover:bg-[#FAE7EF]/30 text-[#555555] hover:text-[#DF0059] transition-all flex items-center gap-1.5 shadow-sm text-[10px] font-black"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
                                    Sync Data
                                </button>
                            )}
                        </div>

                        {/* Contents Viewer Panel (Fitted to exact remaining space) */}
                        <div className="flex-1 min-h-[300px] md:min-h-[220px] overflow-auto border border-[#E5E7EB] rounded-2xl bg-white custom-scrollbar flex flex-col">
                            {loadingData ? (
                                <div className="m-auto p-8 text-center text-xs text-[#727272] font-black flex flex-col items-center gap-2">
                                    <RefreshCw className="w-6 h-6 animate-spin text-[#DF0059]" />
                                    Fetching table records...
                                </div>
                            ) : activeTab === 'erd' ? (
                                /* Visual Database ERD schema map */
                                <div className="p-4 bg-slate-50/50 min-h-full flex flex-col md:flex-row items-stretch justify-center gap-6 text-[10px] overflow-x-auto select-none">
                                    
                                    {/* Primary users table card */}
                                    <div className="w-full md:w-64 bg-white border-2 border-[#DF0059] rounded-2xl shadow-sm flex flex-col overflow-hidden self-start shrink-0">
                                        <div className="bg-[#DF0059] text-white px-3 py-2 font-black flex justify-between items-center text-[11px]">
                                            <span className="flex items-center gap-1">👤 users</span>
                                            <span className="text-[8px] bg-white/20 px-1 py-0.5 rounded font-mono">PRIMARY</span>
                                        </div>
                                        <div className="p-2 space-y-1.5 bg-white">
                                            <div className="flex justify-between items-center bg-[#FFE9F2] px-2 py-1 rounded font-black text-[#DF0059] border border-[#DF0059]/20" title="Primary Key">
                                                <span>🔑 user_name</span>
                                                <span className="text-[8px] font-mono opacity-80">VARCHAR (PK)</span>
                                            </div>
                                            <div className="flex justify-between items-center px-2 py-0.5 text-[#555555]">
                                                <span>balance</span>
                                                <span className="text-[8px] font-mono text-[#727272]">NUMERIC</span>
                                            </div>
                                            <div className="flex justify-between items-center px-2 py-0.5 text-[#555555]">
                                                <span>resilience_score</span>
                                                <span className="text-[8px] font-mono text-[#727272]">INTEGER</span>
                                            </div>
                                            <div className="flex justify-between items-center px-2 py-0.5 text-[#555555]">
                                                <span>streak</span>
                                                <span className="text-[8px] font-mono text-[#727272]">INTEGER</span>
                                            </div>
                                            <div className="flex justify-between items-center px-2 py-0.5 text-[#555555]">
                                                <span>state_data</span>
                                                <span className="text-[8px] font-mono text-[#727272]">JSONB</span>
                                            </div>
                                            <div className="flex justify-between items-center px-2 py-0.5 text-[#555555]">
                                                <span>updated_at</span>
                                                <span className="text-[8px] font-mono text-[#727272]">TIMESTAMP</span>
                                            </div>
                                        </div>
                                        <div className="bg-[#FAE7EF] px-2 py-1 text-[8px] text-[#DF0059] text-center font-black uppercase tracking-tighter border-t border-[#F5CFDE]">
                                            References: 1 to Many (1:N)
                                        </div>
                                    </div>

                                    {/* Relationship Columns container */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 min-w-0 md:min-w-[320px]">
                                        
                                        {/* Table savings */}
                                        <div className="bg-white border border-[#FAE7EF] hover:border-[#DF0059]/40 rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all duration-300">
                                            <div className="bg-[#555555] text-white px-3 py-1.5 font-black flex justify-between items-center text-[10px]">
                                                <span className="flex items-center gap-1">🎯 savings</span>
                                                <span className="text-[8px] bg-white/20 px-1 py-0.5 rounded font-mono">1:N Link</span>
                                            </div>
                                            <div className="p-2 space-y-1">
                                                <div className="flex justify-between items-center bg-slate-50 px-2 py-0.5 rounded font-bold text-slate-800">
                                                    <span>🔑 id</span>
                                                    <span className="text-[8px] font-mono text-[#727272]">VARCHAR (PK)</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-[#E9F2FE] px-2 py-0.5 rounded font-black text-[#237AF9] border border-[#237AF9]/15" title="Foreign Key referencing users.user_name">
                                                    <span>🔗 user_name</span>
                                                    <span className="text-[8px] font-mono">VARCHAR (FK)</span>
                                                </div>
                                                <div className="flex justify-between items-center px-2 py-0.5 text-[#727272]">
                                                    <span>name</span>
                                                    <span className="text-[8px] font-mono">VARCHAR</span>
                                                </div>
                                                <div className="flex justify-between items-center px-2 py-0.5 text-[#727272]">
                                                    <span>target_amount</span>
                                                    <span className="text-[8px] font-mono">NUMERIC</span>
                                                </div>
                                                <div className="flex justify-between items-center px-2 py-0.5 text-[#727272]">
                                                    <span>current_amount</span>
                                                    <span className="text-[8px] font-mono">NUMERIC</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Table transfers */}
                                        <div className="bg-white border border-[#FAE7EF] hover:border-[#DF0059]/40 rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all duration-300">
                                            <div className="bg-[#555555] text-white px-3 py-1.5 font-black flex justify-between items-center text-[10px]">
                                                <span className="flex items-center gap-1">💸 transfers</span>
                                                <span className="text-[8px] bg-white/20 px-1 py-0.5 rounded font-mono">1:N Link</span>
                                            </div>
                                            <div className="p-2 space-y-1">
                                                <div className="flex justify-between items-center bg-slate-50 px-2 py-0.5 rounded font-bold text-slate-800">
                                                    <span>🔑 id</span>
                                                    <span className="text-[8px] font-mono text-[#727272]">VARCHAR (PK)</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-[#E9F2FE] px-2 py-0.5 rounded font-black text-[#237AF9] border border-[#237AF9]/15" title="Foreign Key referencing users.user_name">
                                                    <span>🔗 user_name</span>
                                                    <span className="text-[8px] font-mono">VARCHAR (FK)</span>
                                                </div>
                                                <div className="flex justify-between items-center px-2 py-0.5 text-[#727272]">
                                                    <span>title</span>
                                                    <span className="text-[8px] font-mono">VARCHAR</span>
                                                </div>
                                                <div className="flex justify-between items-center px-2 py-0.5 text-[#727272]">
                                                    <span>amount</span>
                                                    <span className="text-[8px] font-mono">NUMERIC</span>
                                                </div>
                                                <div className="flex justify-between items-center px-2 py-0.5 text-[#727272]">
                                                    <span>type</span>
                                                    <span className="text-[8px] font-mono">VARCHAR</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Table bills */}
                                        <div className="bg-white border border-[#FAE7EF] hover:border-[#DF0059]/40 rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all duration-300">
                                            <div className="bg-[#555555] text-white px-3 py-1.5 font-black flex justify-between items-center text-[10px]">
                                                <span className="flex items-center gap-1">📱 bills</span>
                                                <span className="text-[8px] bg-white/20 px-1 py-0.5 rounded font-mono">1:N Link</span>
                                            </div>
                                            <div className="p-2 space-y-1">
                                                <div className="flex justify-between items-center bg-slate-50 px-2 py-0.5 rounded font-bold text-slate-800">
                                                    <span>🔑 id</span>
                                                    <span className="text-[8px] font-mono text-[#727272]">VARCHAR (PK)</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-[#E9F2FE] px-2 py-0.5 rounded font-black text-[#237AF9] border border-[#237AF9]/15" title="Foreign Key referencing users.user_name">
                                                    <span>🔗 user_name</span>
                                                    <span className="text-[8px] font-mono">VARCHAR (FK)</span>
                                                </div>
                                                <div className="flex justify-between items-center px-2 py-0.5 text-[#727272]">
                                                    <span>name</span>
                                                    <span className="text-[8px] font-mono">VARCHAR</span>
                                                </div>
                                                <div className="flex justify-between items-center px-2 py-0.5 text-[#727272]">
                                                    <span>amount</span>
                                                    <span className="text-[8px] font-mono">NUMERIC</span>
                                                </div>
                                                <div className="flex justify-between items-center px-2 py-0.5 text-[#727272]">
                                                    <span>is_locked</span>
                                                    <span className="text-[8px] font-mono">BOOLEAN</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Table chat_logs */}
                                        <div className="bg-white border border-[#FAE7EF] hover:border-[#DF0059]/40 rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all duration-300">
                                            <div className="bg-[#555555] text-white px-3 py-1.5 font-black flex justify-between items-center text-[10px]">
                                                <span className="flex items-center gap-1">💬 chat_logs</span>
                                                <span className="text-[8px] bg-white/20 px-1 py-0.5 rounded font-mono">1:N Link</span>
                                            </div>
                                            <div className="p-2 space-y-1">
                                                <div className="flex justify-between items-center bg-slate-50 px-2 py-0.5 rounded font-bold text-slate-800">
                                                    <span>🔑 id</span>
                                                    <span className="text-[8px] font-mono text-[#727272]">SERIAL (PK)</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-[#E9F2FE] px-2 py-0.5 rounded font-black text-[#237AF9] border border-[#237AF9]/15" title="Foreign Key referencing users.user_name">
                                                    <span>🔗 user_name</span>
                                                    <span className="text-[8px] font-mono">VARCHAR (FK)</span>
                                                </div>
                                                <div className="flex justify-between items-center px-2 py-0.5 text-[#727272]">
                                                    <span>agent_id</span>
                                                    <span className="text-[8px] font-mono">VARCHAR</span>
                                                </div>
                                                <div className="flex justify-between items-center px-2 py-0.5 text-[#727272]">
                                                    <span>message</span>
                                                    <span className="text-[8px] font-mono">TEXT</span>
                                                </div>
                                                <div className="flex justify-between items-center px-2 py-0.5 text-[#727272]">
                                                    <span>timestamp</span>
                                                    <span className="text-[8px] font-mono">TIMESTAMP</span>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            ) : activeTab === 'chat' ? (
                                chatLogs.length === 0 ? (
                                    <div className="m-auto p-16 text-center text-xs text-[#727272] font-semibold leading-relaxed">
                                        No records found in table <code className="text-[#DF0059] bg-[#FAE7EF] px-2 py-0.5 rounded font-black font-mono">chat_logs</code>.<br />
                                        <span className="text-[10px] text-[#727272]">Send a message to the AI coach inside the application to populate.</span>
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse text-[10px]">
                                        <thead>
                                            <tr className="border-b border-[#E5E7EB] bg-[#FAFAFA] font-black text-[#555555] uppercase tracking-wider text-[8px] sticky top-0 z-10">
                                                <th className="p-3 bg-[#FAFAFA]">Timestamp</th>
                                                <th className="p-3 bg-[#FAFAFA]">User</th>
                                                <th className="p-3 bg-[#FAFAFA]">Agent</th>
                                                <th className="p-3 bg-[#FAFAFA]">Message</th>
                                                <th className="p-3 bg-[#FAFAFA]">Response</th>
                                                <th className="p-3 bg-[#FAFAFA]">Called Func</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#E5E7EB] font-semibold text-[#221F20]">
                                            {chatLogs.map((log) => (
                                                <tr key={log.id} className="hover:bg-[#FAE7EF]/10 transition-colors">
                                                    <td className="p-3 text-[#727272] font-mono">
                                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                    </td>
                                                    <td className="p-3 font-black text-[#DF0059]">{log.user_name}</td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-0.5 rounded-full font-black text-[8px] border ${
                                                            log.agent_id === 'finance' ? 'bg-[#FFE9F2] text-[#DF0059] border-[#DF0059]/15' :
                                                            log.agent_id === 'save' ? 'bg-[#FFF4D5] text-[#CBA024] border-[#CBA024]/15' :
                                                            log.agent_id === 'invest' ? 'bg-[#E9F2FE] text-[#237AF9] border-[#237AF9]/15' :
                                                            'bg-[#F3F4F6] text-[#555555] border-[#E5E7EB]'
                                                        }`}>
                                                            {log.agent_id}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 max-w-[150px] truncate font-medium text-[#221F20]" title={log.message}>{log.message}</td>
                                                    <td className="p-3 max-w-[200px] truncate text-[#555555] font-medium" title={log.response}>{log.response}</td>
                                                    <td className="p-3 font-mono text-[#727272]">{log.function_called || 'none'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )
                            ) : activeTab === 'sync' ? (
                                userSyncs.length === 0 ? (
                                    <div className="m-auto p-16 text-center text-xs text-[#727272] font-semibold leading-relaxed">
                                        No records found in table <code className="text-[#DF0059] bg-[#FAE7EF] px-2 py-0.5 rounded font-black font-mono">users</code>.<br />
                                        <span className="text-[10px] text-[#727272]">Initial sync occurs when user profile properties trigger sync requests.</span>
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse text-[10px]">
                                        <thead>
                                            <tr className="border-b border-[#E5E7EB] bg-[#FAFAFA] font-black text-[#555555] uppercase tracking-wider text-[8px] sticky top-0 z-10">
                                                <th className="p-3 bg-[#FAFAFA]">User</th>
                                                <th className="p-3 bg-[#FAFAFA]">Wallet Balance</th>
                                                <th className="p-3 bg-[#FAFAFA]">Resilience Score</th>
                                                <th className="p-3 bg-[#FAFAFA]">Streak Count</th>
                                                <th className="p-3 bg-[#FAFAFA]">Last Sync</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#E5E7EB] font-semibold text-[#221F20]">
                                            {userSyncs.map((sync) => (
                                                <tr key={sync.user_name} className="hover:bg-[#FAE7EF]/10 transition-colors">
                                                    <td className="p-3 font-black text-[#DF0059]">{sync.user_name}</td>
                                                    <td className="p-3 font-black text-[#49B9B3] font-mono text-xs">RM {parseFloat(sync.balance).toFixed(2)}</td>
                                                    <td className="p-3 font-black text-[#237AF9]">{sync.resilience_score}%</td>
                                                    <td className="p-3 font-black text-[#FFC107]">{sync.streak} days</td>
                                                    <td className="p-3 text-[#727272] font-mono">
                                                        {new Date(sync.updated_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )
                            ) : activeTab === 'savings' ? (
                                savingsList.length === 0 ? (
                                    <div className="m-auto p-16 text-center text-xs text-[#727272] font-semibold leading-relaxed">
                                        No records found in table <code className="text-[#DF0059] bg-[#FAE7EF] px-2 py-0.5 rounded font-black font-mono">savings</code>.<br />
                                        <span className="text-[10px] text-[#727272]">Add a savings goal inside the app dashboard to sync savings data.</span>
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse text-[10px]">
                                        <thead>
                                            <tr className="border-b border-[#E5E7EB] bg-[#FAFAFA] font-black text-[#555555] uppercase tracking-wider text-[8px] sticky top-0 z-10">
                                                <th className="p-3 bg-[#FAFAFA]">ID</th>
                                                <th className="p-3 bg-[#FAFAFA]">User</th>
                                                <th className="p-3 bg-[#FAFAFA]">Goal Name</th>
                                                <th className="p-3 bg-[#FAFAFA]">Target</th>
                                                <th className="p-3 bg-[#FAFAFA]">Saved</th>
                                                <th className="p-3 bg-[#FAFAFA]">Icon</th>
                                                <th className="p-3 bg-[#FAFAFA]">Mode</th>
                                                <th className="p-3 bg-[#FAFAFA]">Risk</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#E5E7EB] font-semibold text-[#221F20]">
                                            {savingsList.map((item) => (
                                                <tr key={item.id} className="hover:bg-[#FAE7EF]/10 transition-colors">
                                                    <td className="p-3 text-[#727272] font-mono select-none">{item.id}</td>
                                                    <td className="p-3 font-black text-[#DF0059]">{item.user_name}</td>
                                                    <td className="p-3 font-black text-[#221F20]">{item.name}</td>
                                                    <td className="p-3 font-mono text-[#555555]">RM {parseFloat(item.target_amount || '0').toFixed(2)}</td>
                                                    <td className="p-3 font-black font-mono text-[#49B9B3] text-xs">RM {parseFloat(item.current_amount || '0').toFixed(2)}</td>
                                                    <td className="p-3 text-sm select-none">{item.icon}</td>
                                                    <td className="p-3 uppercase text-[#727272] font-black text-[9px]">{item.mode}</td>
                                                    <td className="p-3">
                                                        <span className={`px-2.5 py-0.5 rounded-full font-black text-[8px] border ${
                                                            item.risk_level === 'high' ? 'bg-[#FFE9F2] text-[#DF0059] border-[#DF0059]/15' :
                                                            item.risk_level === 'medium' ? 'bg-[#FFF4D5] text-[#CBA024] border-[#CBA024]/15' :
                                                            'bg-[#E8F6EF] text-[#49B9B3] border-[#49B9B3]/15'
                                                        }`}>
                                                            {item.risk_level}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )
                            ) : activeTab === 'transfers' ? (
                                transfersList.length === 0 ? (
                                    <div className="m-auto p-16 text-center text-xs text-[#727272] font-semibold leading-relaxed">
                                        No records found in table <code className="text-[#DF0059] bg-[#FAE7EF] px-2 py-0.5 rounded font-black font-mono">transfers</code>.<br />
                                        <span className="text-[10px] text-[#727272]">Complete a transfer or money transaction to sync record history.</span>
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse text-[10px]">
                                        <thead>
                                            <tr className="border-b border-[#E5E7EB] bg-[#FAFAFA] font-black text-[#555555] uppercase tracking-wider text-[8px] sticky top-0 z-10">
                                                <th className="p-3 bg-[#FAFAFA]">ID</th>
                                                <th className="p-3 bg-[#FAFAFA]">User</th>
                                                <th className="p-3 bg-[#FAFAFA]">Title</th>
                                                <th className="p-3 bg-[#FAFAFA]">Amount</th>
                                                <th className="p-3 bg-[#FAFAFA]">Type</th>
                                                <th className="p-3 bg-[#FAFAFA]">Category</th>
                                                <th className="p-3 bg-[#FAFAFA]">Conf.</th>
                                                <th className="p-3 bg-[#FAFAFA]">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#E5E7EB] font-semibold text-[#221F20]">
                                            {transfersList.map((item) => (
                                                <tr key={item.id} className="hover:bg-[#FAE7EF]/10 transition-colors">
                                                    <td className="p-3 text-[#727272] font-mono select-none">{item.id}</td>
                                                    <td className="p-3 font-black text-[#DF0059]">{item.user_name}</td>
                                                    <td className="p-3 font-black text-[#221F20]">{item.title}</td>
                                                    <td className="p-3 font-black font-mono text-[#DF0059] text-xs">RM {parseFloat(item.amount || '0').toFixed(2)}</td>
                                                    <td className="p-3 select-none">
                                                        <span className={`px-2.5 py-0.5 rounded-full font-black text-[8px] border ${
                                                            item.type === 'expense' ? 'bg-[#FFE9F2] text-[#DF0059] border-[#DF0059]/15' :
                                                            item.type === 'income' ? 'bg-[#E8F6EF] text-[#49B9B3] border-[#49B9B3]/15' :
                                                            'bg-[#FFF4D5] text-[#CBA024] border-[#CBA024]/15'
                                                        }`}>
                                                            {item.type}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-[#555555] font-black text-[9px] uppercase tracking-wider">{item.category}</td>
                                                    <td className="p-3 font-mono text-[#727272]">{((parseFloat(item.confidence) || 1) * 100).toFixed(0)}%</td>
                                                    <td className="p-3 text-[#727272] font-mono">
                                                        {new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )
                            ) : (
                                billsList.length === 0 ? (
                                    <div className="m-auto p-16 text-center text-xs text-[#727272] font-semibold leading-relaxed">
                                        No records found in table <code className="text-[#DF0059] bg-[#FAE7EF] px-2 py-0.5 rounded font-black font-mono">bills</code>.<br />
                                        <span className="text-[10px] text-[#727272]">Add commitment schedules inside the Smart Lock Bills screen to sync.</span>
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse text-[10px]">
                                        <thead>
                                            <tr className="border-b border-[#E5E7EB] bg-[#FAFAFA] font-black text-[#555555] uppercase tracking-wider text-[8px] sticky top-0 z-10">
                                                <th className="p-3 bg-[#FAFAFA]">ID</th>
                                                <th className="p-3 bg-[#FAFAFA]">User</th>
                                                <th className="p-3 bg-[#FAFAFA]">Bill Name</th>
                                                <th className="p-3 bg-[#FAFAFA]">Category</th>
                                                <th className="p-3 bg-[#FAFAFA]">Amount</th>
                                                <th className="p-3 bg-[#FAFAFA]">Due Day</th>
                                                <th className="p-3 bg-[#FAFAFA]">Next Due</th>
                                                <th className="p-3 bg-[#FAFAFA]">Lock</th>
                                                <th className="p-3 bg-[#FAFAFA]">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#E5E7EB] font-semibold text-[#221F20]">
                                            {billsList.map((item) => (
                                                <tr key={item.id} className="hover:bg-[#FAE7EF]/10 transition-colors">
                                                    <td className="p-3 text-[#727272] font-mono select-none">{item.id}</td>
                                                    <td className="p-3 font-black text-[#DF0059]">{item.user_name}</td>
                                                    <td className="p-3 font-black text-[#221F20]">{item.name}</td>
                                                    <td className="p-3 uppercase text-[#727272] font-black text-[9px] tracking-wider">{item.category}</td>
                                                    <td className="p-3 font-black font-mono text-[#221F20] text-xs">RM {parseFloat(item.amount || '0').toFixed(2)}</td>
                                                    <td className="p-3 font-mono text-[#555555]">{item.due_day || 'N/A'}</td>
                                                    <td className="p-3 font-mono text-[#727272]">
                                                        {new Date(item.next_due_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`px-2.5 py-0.5 rounded-full font-black text-[8px] border ${
                                                            item.is_locked ? 'bg-[#E8F6EF] text-[#49B9B3] border-[#49B9B3]/15' : 'bg-[#F3F4F6] text-[#555555] border-[#E5E7EB]'
                                                        }`}>
                                                            {item.is_locked ? 'LOCKED 🔒' : 'UNLOCKED'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`px-2.5 py-0.5 rounded-full font-black text-[8px] border ${
                                                            item.status === 'paid' ? 'bg-[#E8F6EF] text-[#49B9B3] border-[#49B9B3]/15' :
                                                            item.status === 'missed' ? 'bg-[#FFE9F2] text-[#DF0059] border-[#DF0059]/15' :
                                                            'bg-[#FFF4D5] text-[#CBA024] border-[#CBA024]/15'
                                                        }`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

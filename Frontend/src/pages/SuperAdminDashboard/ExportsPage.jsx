import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Download, FileText, Calendar, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "../../components/ui/use-toast";
import { useTranslation } from "react-i18next";
import api from "../../utils/api";

const EXPORT_HISTORY_KEY = "pos.super-admin.export-history";

const csvEscape = (value) => {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const downloadCsv = (filename, rows) => {
  const headers = rows.length ? Object.keys(rows[0]) : ["message"];
  const content = [
    headers.map(csvEscape).join(","),
    ...(rows.length ? rows : [{ message: "No records found" }]).map((row) =>
      headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n");
  const blob = new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
  return blob.size;
};

const withinDateRange = (dateValue, dateRange) => {
  if (!dateValue) return true;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return true;
  if (dateRange.from && date < new Date(`${dateRange.from}T00:00:00`)) return false;
  if (dateRange.to && date > new Date(`${dateRange.to}T23:59:59.999`)) return false;
  return true;
};

export default function ExportsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [isExporting, setIsExporting] = useState(false);
  const [recentExports, setRecentExports] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(EXPORT_HISTORY_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const exportTypes = [
    {
      id: "store-list",
      name: t('superAdminModule.exports.available.types.store-list.name'),
      description: t('superAdminModule.exports.available.types.store-list.desc'),
      format: "CSV",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: "store-status",
      name: t('superAdminModule.exports.available.types.store-status.name'),
      description: t('superAdminModule.exports.available.types.store-status.desc'),
      format: "CSV",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: "pending-requests",
      name: t('superAdminModule.exports.available.types.pending-requests.name'),
      description: t('superAdminModule.exports.available.types.pending-requests.desc'),
      format: "CSV",
      icon: <FileText className="w-5 h-5" />,
    },
  ];

  const handleExport = async () => {
    if (!selectedType) {
      toast({
        title: t('superAdminModule.exports.recent.toast.selectType'),
        description: t('superAdminModule.exports.recent.toast.selectTypeDesc'),
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const exportType = exportTypes.find(type => type.id === selectedType);
      const params = selectedType === "pending-requests" ? { status: "PENDING" } : undefined;
      const response = await api.get("/api/v1/stores", { params });
      const stores = Array.isArray(response.data) ? response.data : [];
      const rows = stores
        .filter((store) => withinDateRange(store.createdAt, dateRange))
        .map((store) => ({
          id: store.id,
          brand: store.brand,
          status: store.status,
          storeType: store.storeType,
          email: store.contact?.email || store.storeAdmin?.email,
          phone: store.contact?.phone || store.storeAdmin?.phone,
          createdAt: store.createdAt,
        }));
      const timestamp = new Date();
      const filename = `${selectedType}-${timestamp.toISOString().slice(0, 10)}.csv`;
      const size = downloadCsv(filename, rows);
      const item = {
        id: `${timestamp.getTime()}`,
        type: exportType.name,
        date: timestamp.toLocaleString(),
        status: "completed",
        size: `${size} B`,
        downloads: 1,
        filename,
        rows,
      };
      const updatedHistory = [item, ...recentExports].slice(0, 10);
      setRecentExports(updatedHistory);
      localStorage.setItem(EXPORT_HISTORY_KEY, JSON.stringify(updatedHistory));
      toast({
        title: t('superAdminModule.exports.create.started'),
        description: `${t('superAdminModule.exports.create.startedDesc', { name: exportType.name })} (${rows.length} records)`,
      });
      setSelectedType("");
      setDateRange({ from: "", to: "" });
    } catch (error) {
      toast({
        title: t('superAdminModule.exports.create.started'),
        description: error?.customMessage || t('superAdminModule.exports.recent.toast.downloadStartedDesc'),
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = (exportItem) => {
    downloadCsv(exportItem.filename, exportItem.rows || []);
    const updatedHistory = recentExports.map((item) => item.id === exportItem.id
      ? { ...item, downloads: item.downloads + 1 }
      : item);
    setRecentExports(updatedHistory);
    localStorage.setItem(EXPORT_HISTORY_KEY, JSON.stringify(updatedHistory));
    toast({
      title: t('superAdminModule.exports.recent.toast.downloadStarted'),
      description: `${t('superAdminModule.exports.recent.toast.downloadStartedDesc')} (#${exportItem.id})`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">{t('superAdminModule.exports.title')}</h2>
        <p className="text-gray-400">
          {t('superAdminModule.exports.subtitle')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Export Configuration */}
        <Card className="bg-black/20 backdrop-blur-lg border border-white/10 text-white">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="flex items-center gap-2 text-white">
              <Download className="w-5 h-5" />
              {t('superAdminModule.exports.create.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="export-type" className="text-gray-300">{t('superAdminModule.exports.create.typeLabel')}</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder={t('superAdminModule.exports.create.typePlaceholder')} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800/80 border-white/10 text-white backdrop-blur-lg">
                  {exportTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        {type.icon}
                        <div>
                          <div className="font-medium">{type.name}</div>
                          <div className="text-xs text-gray-400">
                            {type.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-from" className="text-gray-300">{t('superAdminModule.exports.create.fromLabel')}</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="bg-white/5 border-white/20 text-white placeholder-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-to" className="text-gray-300">{t('superAdminModule.exports.create.toLabel')}</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="bg-white/5 border-white/20 text-white placeholder-gray-500"
                />
              </div>
            </div>

            <Button 
              onClick={handleExport} 
              disabled={isExporting || !selectedType}
              className="w-full bg-emerald-600 hover:bg-emerald-500"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('superAdminModule.exports.create.exporting')}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  {t('superAdminModule.exports.create.button')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Export Types Info */}
        <Card className="bg-black/20 backdrop-blur-lg border border-white/10 text-white">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white">{t('superAdminModule.exports.available.title')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {exportTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex items-start gap-3 p-3 border border-white/10 rounded-lg hover:bg-white/5"
                >
                  <div className="text-gray-400 mt-1">
                    {type.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{type.name}</h4>
                      <Badge variant="outline" className="text-xs border-white/20">
                        {type.format}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {type.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Exports */}
      <Card className="bg-black/20 backdrop-blur-lg border border-white/10 text-white">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-white">{t('superAdminModule.exports.recent.title')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {recentExports.map((exportItem) => (
              <div
                key={exportItem.id}
                className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-black/20"
              >
                <div className="flex items-center gap-3">
                  <div className="text-gray-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">{exportItem.type}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {exportItem.date}
                      </span>
                      <span>{exportItem.size}</span>
                      <span>{exportItem.downloads} {t('superAdminModule.exports.recent.downloads')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline"
                    className="flex items-center gap-1 bg-green-500/10 text-green-300 border-green-500/20"
                  >
                    <CheckCircle className="w-3 h-3" />
                    {exportItem.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm" className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => handleDownload(exportItem)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    {t('superAdminModule.exports.recent.downloadButton')}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {recentExports.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              {t('superAdminModule.exports.recent.noExports')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 

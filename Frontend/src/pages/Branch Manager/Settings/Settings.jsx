import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building,
  Printer,
  Receipt,
  CreditCard,
  Save,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getBranchById } from "@/Redux Toolkit/features/branch/branchThunks";
import BranchInfo from "./BranchInfo";
import { useTranslation } from "react-i18next";

const Settings = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { userProfile } = useSelector((state) => state.user);

  useEffect(() => {
    if (userProfile?.branchId && localStorage.getItem("jwt")) {
      dispatch(
        getBranchById({
          id: userProfile.branchId,
          jwt: localStorage.getItem("jwt"),
        })
      );
    }
  }, [dispatch, userProfile]);

  const [printerSettings, setPrinterSettings] = useState({
    printerName: "Epson TM-T88VI",
    paperSize: "80mm",
    printLogo: true,
    printCustomerDetails: true,
    printItemizedTax: true,
    footerText: "Thank you for shopping with us!",
  });

  const [taxSettings, setTaxSettings] = useState({
    gstEnabled: true,
    gstPercentage: 18,
    applyGstToAll: true,
    showTaxBreakdown: true,
  });

  const [paymentSettings, setPaymentSettings] = useState({
    acceptCash: true,
    acceptUPI: true,
    acceptCard: true,
    upiId: "example@upi",
    cardTerminalId: "TERM12345",
  });

  const [discountSettings, setDiscountSettings] = useState({
    allowDiscount: true,
    maxDiscountPercentage: 10,
    requireManagerApproval: true,
    discountReasons: [
      "Damaged Product",
      "Bulk Purchase",
      "Regular Customer",
      "Promotional Offer",
    ],
  });

  const handlePrinterSettingsChange = (field, value) => {
    setPrinterSettings({
      ...printerSettings,
      [field]: value,
    });
  };

  const handleTaxSettingsChange = (field, value) => {
    setTaxSettings({
      ...taxSettings,
      [field]: value,
    });
  };

  const handlePaymentSettingsChange = (field, value) => {
    setPaymentSettings({
      ...paymentSettings,
      [field]: value,
    });
  };

  const handleDiscountSettingsChange = (field, value) => {
    setDiscountSettings({
      ...discountSettings,
      [field]: value,
    });
  };

  const handleSaveSettings = (settingType) => {
    console.log(`Saving ${settingType} settings`);
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.branchManager.settings.title')}</h1>
          <p className="text-gray-400 mt-1">{t('dashboard.branchManager.settings.subtitle')}</p>
        </div>
      </div>

      <Tabs defaultValue="branch-info">
        <TabsList className="grid w-full grid-cols-5 bg-black/20 backdrop-blur-lg border border-white/10 rounded-lg p-1 h-auto">
          <TabsTrigger value="branch-info" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            {t('dashboard.branchManager.settings.tabs.info')}
          </TabsTrigger>
          <TabsTrigger value="printer" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            {t('dashboard.branchManager.settings.tabs.printer')}
          </TabsTrigger>
          <TabsTrigger value="tax" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            {t('dashboard.branchManager.settings.tabs.tax')}
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            {t('dashboard.branchManager.settings.tabs.payment')}
          </TabsTrigger>
          <TabsTrigger value="discount" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            {t('dashboard.branchManager.settings.tabs.discount')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branch-info">
          <BranchInfo />
        </TabsContent>

        <TabsContent value="printer">
          <Card className="bg-black/20 backdrop-blur-lg border border-white/10 text-white">
            <CardHeader>
              <CardTitle className="text-white">{t('dashboard.branchManager.settings.printer.title')}</CardTitle>
              <CardDescription className="text-gray-400">
                {t('dashboard.branchManager.settings.printer.desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="printer-name" className="text-sm font-medium text-gray-300">
                      {t('dashboard.branchManager.settings.printer.name')}
                    </label>
                    <Input
                      id="printer-name"
                      className="w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40"
                      value={printerSettings.printerName}
                      onChange={(e) => handlePrinterSettingsChange("printerName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="paper-size" className="text-sm font-medium text-gray-300">
                      {t('dashboard.branchManager.settings.printer.paperSize')}
                    </label>
                    <Select
                      value={printerSettings.paperSize}
                      onValueChange={(value) => handlePrinterSettingsChange("paperSize", value)}
                    >
                      <SelectTrigger id="paper-size" className="w-full text-left border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40">
                        <SelectValue placeholder="Select paper size" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800/80 border-white/20 text-white backdrop-blur-lg">
                        <SelectItem value="58mm">58mm</SelectItem>
                        <SelectItem value="80mm">80mm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label htmlFor="print-logo" className="text-sm font-medium text-gray-300">
                      {t('dashboard.branchManager.settings.printer.printLogo')}
                    </label>
                    <Switch
                      id="print-logo"
                      checked={printerSettings.printLogo}
                      onCheckedChange={(checked) => handlePrinterSettingsChange("printLogo", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="print-customer" className="text-sm font-medium text-gray-300">
                      {t('dashboard.branchManager.settings.printer.printCustomer')}
                    </label>
                    <Switch
                      id="print-customer"
                      checked={printerSettings.printCustomerDetails}
                      onCheckedChange={(checked) => handlePrinterSettingsChange("printCustomerDetails", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="print-tax" className="text-sm font-medium text-gray-300">
                      {t('dashboard.branchManager.settings.printer.printTax')}
                    </label>
                    <Switch
                      id="print-tax"
                      checked={printerSettings.printItemizedTax}
                      onCheckedChange={(checked) => handlePrinterSettingsChange("printItemizedTax", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="footer-text" className="text-sm font-medium text-gray-300">
                    {t('dashboard.branchManager.settings.printer.footerText')}
                  </label>
                  <Input
                    id="footer-text"
                    className="w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40"
                    value={printerSettings.footerText}
                    onChange={(e) => handlePrinterSettingsChange("footerText", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  className="gap-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => handleSaveSettings("printer")}
                >
                  <Save className="h-4 w-4" />
                  {t('dashboard.branchManager.settings.printer.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax">
          <Card className="bg-black/20 backdrop-blur-lg border border-white/10 text-white">
            <CardHeader>
              <CardTitle className="text-white">{t('dashboard.branchManager.settings.tax.title')}</CardTitle>
              <CardDescription className="text-gray-400">
                {t('dashboard.branchManager.settings.tax.desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="gst-enabled" className="text-sm font-medium text-gray-300">
                    {t('dashboard.branchManager.settings.tax.enableGst')}
                  </label>
                  <Switch
                    id="gst-enabled"
                    checked={taxSettings.gstEnabled}
                    onCheckedChange={(checked) => handleTaxSettingsChange("gstEnabled", checked)}
                  />
                </div>

                {taxSettings.gstEnabled && (
                  <div className="space-y-4 pl-6 border-l-2 border-white/20">
                    <div className="space-y-2">
                      <label htmlFor="gst-percentage" className="text-sm font-medium text-gray-300">
                        {t('dashboard.branchManager.settings.tax.percentage')}
                      </label>
                      <Input
                        id="gst-percentage"
                        type="number"
                        className="w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40"
                        min="0"
                        max="100"
                        value={taxSettings.gstPercentage}
                        onChange={(e) => handleTaxSettingsChange("gstPercentage", parseInt(e.target.value))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="apply-gst-all" className="text-sm font-medium text-gray-300">
                        {t('dashboard.branchManager.settings.tax.applyToAll')}
                      </label>
                      <Switch
                        id="apply-gst-all"
                        checked={taxSettings.applyGstToAll}
                        onCheckedChange={(checked) => handleTaxSettingsChange("applyGstToAll", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="show-tax-breakdown" className="text-sm font-medium text-gray-300">
                        {t('dashboard.branchManager.settings.tax.showBreakdown')}
                      </label>
                      <Switch
                        id="show-tax-breakdown"
                        checked={taxSettings.showTaxBreakdown}
                        onCheckedChange={(checked) => handleTaxSettingsChange("showTaxBreakdown", checked)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  className="gap-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => handleSaveSettings("tax")}
                >
                  <Save className="h-4 w-4" />
                  {t('dashboard.branchManager.settings.tax.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card className="bg-black/20 backdrop-blur-lg border border-white/10 text-white">
            <CardHeader>
              <CardTitle className="text-white">{t('dashboard.branchManager.settings.payment.title')}</CardTitle>
              <CardDescription className="text-gray-400">
                {t('dashboard.branchManager.settings.payment.desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="accept-cash" className="text-sm font-medium text-gray-300">
                    {t('dashboard.branchManager.settings.payment.acceptCash')}
                  </label>
                  <Switch
                    id="accept-cash"
                    checked={paymentSettings.acceptCash}
                    onCheckedChange={(checked) => handlePaymentSettingsChange("acceptCash", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="accept-upi" className="text-sm font-medium text-gray-300">
                    {t('dashboard.branchManager.settings.payment.acceptUpi')}
                  </label>
                  <Switch
                    id="accept-upi"
                    checked={paymentSettings.acceptUPI}
                    onCheckedChange={(checked) => handlePaymentSettingsChange("acceptUPI", checked)}
                  />
                </div>
                {paymentSettings.acceptUPI && (
                  <div className="space-y-2 pl-6 border-l-2 border-white/20">
                    <label htmlFor="upi-id" className="text-sm font-medium text-gray-300">
                      {t('dashboard.branchManager.settings.payment.upiId')}
                    </label>
                    <Input
                      id="upi-id"
                      className="w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40"
                      value={paymentSettings.upiId}
                      onChange={(e) => handlePaymentSettingsChange("upiId", e.target.value)}
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <label htmlFor="accept-card" className="text-sm font-medium text-gray-300">
                    {t('dashboard.branchManager.settings.payment.acceptCard')}
                  </label>
                  <Switch
                    id="accept-card"
                    checked={paymentSettings.acceptCard}
                    onCheckedChange={(checked) => handlePaymentSettingsChange("acceptCard", checked)}
                  />
                </div>
                {paymentSettings.acceptCard && (
                  <div className="space-y-2 pl-6 border-l-2 border-white/20">
                    <label htmlFor="terminal-id" className="text-sm font-medium text-gray-300">
                      {t('dashboard.branchManager.settings.payment.terminalId')}
                    </label>
                    <Input
                      id="terminal-id"
                      className="w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40"
                      value={paymentSettings.cardTerminalId}
                      onChange={(e) => handlePaymentSettingsChange("cardTerminalId", e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  className="gap-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => handleSaveSettings("payment")}
                >
                  <Save className="h-4 w-4" />
                  {t('dashboard.branchManager.settings.payment.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discount">
          <Card className="bg-black/20 backdrop-blur-lg border border-white/10 text-white">
            <CardHeader>
              <CardTitle className="text-white">{t('dashboard.branchManager.settings.discount.title')}</CardTitle>
              <CardDescription className="text-gray-400">
                {t('dashboard.branchManager.settings.discount.desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="allow-discount" className="text-sm font-medium text-gray-300">
                    {t('dashboard.branchManager.settings.discount.allow')}
                  </label>
                  <Switch
                    id="allow-discount"
                    checked={discountSettings.allowDiscount}
                    onCheckedChange={(checked) => handleDiscountSettingsChange("allowDiscount", checked)}
                  />
                </div>

                {discountSettings.allowDiscount && (
                  <div className="space-y-4 pl-6 border-l-2 border-white/20">
                    <div className="space-y-2">
                      <label htmlFor="max-discount" className="text-sm font-medium text-gray-300">
                        {t('dashboard.branchManager.settings.discount.maxPercentage')}
                      </label>
                      <Input
                        id="max-discount"
                        type="number"
                        className="w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40"
                        min="0"
                        max="100"
                        value={discountSettings.maxDiscountPercentage}
                        onChange={(e) => handleDiscountSettingsChange("maxDiscountPercentage", parseInt(e.target.value))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="manager-approval" className="text-sm font-medium text-gray-300">
                        {t('dashboard.branchManager.settings.discount.approval')}
                      </label>
                      <Switch
                        id="manager-approval"
                        checked={discountSettings.requireManagerApproval}
                        onCheckedChange={(checked) => handleDiscountSettingsChange("requireManagerApproval", checked)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        {t('dashboard.branchManager.settings.discount.reasons')}
                      </label>
                      <div className="space-y-2">
                        {discountSettings.discountReasons.map((reason, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              className="w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40"
                              value={reason}
                              onChange={(e) => {
                                const updatedReasons = [...discountSettings.discountReasons];
                                updatedReasons[index] = e.target.value;
                                handleDiscountSettingsChange("discountReasons", updatedReasons);
                              }}
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                const updatedReasons = discountSettings.discountReasons.filter((_, i) => i !== index);
                                handleDiscountSettingsChange("discountReasons", updatedReasons);
                              }}
                              className="bg-transparent border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                            >
                              ✕
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline" className="bg-transparent border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
                          size="sm"
                          onClick={() => {
                            handleDiscountSettingsChange("discountReasons", [...discountSettings.discountReasons, ""]);
                          }}
                        >
                          {t('dashboard.branchManager.settings.discount.addReason')}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  className="gap-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => handleSaveSettings("discount")}
                >
                  <Save className="h-4 w-4" />
                  {t('dashboard.branchManager.settings.discount.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

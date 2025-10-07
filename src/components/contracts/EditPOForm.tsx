import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface EditPOFormProps {
  po: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditPOForm({ po, onSuccess, onCancel }: EditPOFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    po_number: po.poNumber || '',
    valid_from: po.validFrom || '',
    valid_to: po.validTo || '',
    total_amount: po.totalAmount || '',
    currency: po.currency || 'USD',
    status: po.status || 'active',
    doc_link: po.docLink || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Update PO via service
      toast({
        title: "Success",
        description: "Purchase Order updated successfully",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update Purchase Order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="po_number">PO Number*</Label>
        <Input
          id="po_number"
          value={formData.po_number}
          onChange={(e) => setFormData({ ...formData, po_number: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="valid_from">Valid From*</Label>
          <Input
            id="valid_from"
            type="date"
            value={formData.valid_from}
            onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="valid_to">Valid To*</Label>
          <Input
            id="valid_to"
            type="date"
            value={formData.valid_to}
            onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="total_amount">Total Amount*</Label>
          <Input
            id="total_amount"
            type="number"
            value={formData.total_amount}
            onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="doc_link">Document Link</Label>
        <Input
          id="doc_link"
          type="url"
          placeholder="https://..."
          value={formData.doc_link}
          onChange={(e) => setFormData({ ...formData, doc_link: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="terminated">Terminated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

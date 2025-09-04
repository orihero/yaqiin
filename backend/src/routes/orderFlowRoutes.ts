import { NextFunction, Request, Response, Router } from "express";
import { OrderFlowService } from "../services/orderFlowService";
import authMiddleware from "../utils/authMiddleware";

const router = Router();

// Get all order flows
router.get(
  "/",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const flows = await OrderFlowService.getAllFlows();
      res.json({ success: true, data: flows });
    } catch (err: any) {
      next({ status: 500, message: "Failed to fetch order flows", details: err });
    }
  }
);

// Get order flow by ID
router.get(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const flow = await OrderFlowService.getFlowById(req.params.id);
      if (!flow) {
        next({ status: 404, message: "Order flow not found" });
        return;
      }
      res.json({ success: true, data: flow });
    } catch (err: any) {
      next({ status: 500, message: "Failed to fetch order flow", details: err });
    }
  }
);

// Get flow for specific shop
router.get(
  "/shop/:shopId",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const flow = await OrderFlowService.getFlowForShop(req.params.shopId);
      res.json({ success: true, data: flow });
    } catch (err: any) {
      next({ status: 500, message: "Failed to fetch shop order flow", details: err });
    }
  }
);

// Get step by status
router.get(
  "/step/:status",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { shopId } = req.query;
      const step = await OrderFlowService.getStepByStatus(req.params.status, shopId as string);
      if (!step) {
        next({ status: 404, message: "Order flow step not found" });
        return;
      }
      res.json({ success: true, data: step });
    } catch (err: any) {
      next({ status: 500, message: "Failed to fetch order flow step", details: err });
    }
  }
);

// Get next possible statuses
router.get(
  "/next-statuses/:currentStatus",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { shopId } = req.query;
      const nextStatuses = await OrderFlowService.getNextStatuses(req.params.currentStatus, shopId as string);
      res.json({ success: true, data: nextStatuses });
    } catch (err: any) {
      next({ status: 500, message: "Failed to fetch next statuses", details: err });
    }
  }
);

// Check if user can change status
router.post(
  "/can-change-status",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { currentStatus, newStatus, userRole, shopId } = req.body;
      const canChange = await OrderFlowService.canChangeStatus(currentStatus, newStatus, userRole, shopId);
      res.json({ success: true, data: { canChange } });
    } catch (err: any) {
      next({ status: 500, message: "Failed to check status change permission", details: err });
    }
  }
);

// Create new order flow
router.post(
  "/",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Only admins can create flows
      if ((req as any).user.role !== "admin") {
        res.status(403).json({ success: false, message: "Only admins can create order flows" });
        return;
      }

      const flow = await OrderFlowService.createFlow(req.body);
      res.status(201).json({ success: true, data: flow, message: "Order flow created successfully" });
    } catch (err: any) {
      next({ status: 400, message: "Failed to create order flow", details: err });
    }
  }
);

// Update order flow
router.put(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Only admins can update flows
      if ((req as any).user.role !== "admin") {
        res.status(403).json({ success: false, message: "Only admins can update order flows" });
        return;
      }

      const flow = await OrderFlowService.updateFlow(req.params.id, req.body);
      if (!flow) {
        next({ status: 404, message: "Order flow not found" });
        return;
      }
      res.json({ success: true, data: flow, message: "Order flow updated successfully" });
    } catch (err: any) {
      next({ status: 400, message: "Failed to update order flow", details: err });
    }
  }
);

// Delete order flow
router.delete(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Only admins can delete flows
      if ((req as any).user.role !== "admin") {
        res.status(403).json({ success: false, message: "Only admins can delete order flows" });
        return;
      }

      const flow = await OrderFlowService.deleteFlow(req.params.id);
      if (!flow) {
        next({ status: 404, message: "Order flow not found" });
        return;
      }
      res.json({ success: true, message: "Order flow deleted successfully" });
    } catch (err: any) {
      next({ status: 400, message: "Failed to delete order flow", details: err });
    }
  }
);

// Set flow as default
router.post(
  "/:id/set-default",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Only admins can set default flows
      if ((req as any).user.role !== "admin") {
        res.status(403).json({ success: false, message: "Only admins can set default order flows" });
        return;
      }

      const flow = await OrderFlowService.setDefaultFlow(req.params.id);
      if (!flow) {
        next({ status: 404, message: "Order flow not found" });
        return;
      }
      res.json({ success: true, data: flow, message: "Default order flow set successfully" });
    } catch (err: any) {
      next({ status: 400, message: "Failed to set default order flow", details: err });
    }
  }
);

// Get forwarding destinations for a status
router.get(
  "/forwarding-destinations/:status",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { shopId } = req.query;
      const destinations = await OrderFlowService.getForwardingDestinations(req.params.status, shopId as string);
      res.json({ success: true, data: destinations });
    } catch (err: any) {
      next({ status: 500, message: "Failed to fetch forwarding destinations", details: err });
    }
  }
);

export default router; 
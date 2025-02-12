import { Router } from 'express';
import { barberController } from '../controllers/barberController.js';
import { authenticateUser, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Rotte pubbliche (senza autenticazione)
router.get('/public', barberController.getActiveBarbers);
router.get('/public/:id', barberController.getPublicBarberDetails);
router.get('/:id/check-vacation', barberController.checkVacation);
// Rotte che richiedono autenticazione
router.use(authenticateUser);

// Rotte per utenti autenticati
router.get('/', barberController.getAllBarbers);
router.get('/:id', barberController.getBarber);
router.get('/:id/schedule', barberController.getBarberSchedule);
router.get('/:id/availability', barberController.getBarberAvailability);

// Rotte protette (solo admin)
router.post('/', requireAdmin, barberController.createBarber);
router.put('/:id', requireAdmin, barberController.updateBarber);
router.delete('/:id', requireAdmin, barberController.deactivateBarber);
router.put('/:id/vacations', requireAdmin, barberController.updateVacations);
// Rotte per gli orari di lavoro (solo admin)
router.put('/:id/working-hours/:day', requireAdmin, barberController.updateWorkingHours);

// Le nuove rotte per servizi e orari completi
if (barberController.updateAllWorkingHours) {
  router.put('/:id/working-hours', requireAdmin, barberController.updateAllWorkingHours);
}
if (barberController.updateBarberServices) {
  router.put('/:id/services', requireAdmin, barberController.updateBarberServices);
}

// Statistiche
router.get('/:id/stats', requireAdmin, barberController.getBarberStats);

export default router;
